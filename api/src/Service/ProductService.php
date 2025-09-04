<?php

namespace App\Service;

use App\Entity\Car;
use App\Entity\Motorcycle;
use App\Entity\Product;
use App\Entity\ProductFollow;
use App\Entity\Trailer;
use App\Entity\Truck;
use App\Entity\User;
use App\Enum\CarCategory;
use App\Repository\ProductFollowRepository;
use App\Repository\ProductRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

readonly class ProductService
{
    public function __construct(
        private ProductRepository $productRepository,
        private ProductFollowRepository $productFollowRepository,
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator,
    ) {
    }

    /**
     * @param array<string, mixed> $productData
     *
     * @return array{success: bool, error?: string, errors?: array<string, string>, product?: array<string, mixed>}
     */
    public function createProduct(array $productData, User $merchant): array
    {
        error_log('=== ProductService::createProduct called ===');
        error_log('Merchant ID: ' . $merchant->getId());
        error_log('Merchant Email: ' . $merchant->getEmail());
        error_log('Is merchant managed by EntityManager: ' . ($this->entityManager->contains($merchant) ? 'YES' : 'NO'));

        if (!$merchant->isMerchant()) {
            return [
                'success' => false,
                'error' => 'Only merchants can create products',
            ];
        }

        // Validate required type field
        if (!isset($productData['type']) || !\is_string($productData['type'])) {
            return [
                'success' => false,
                'error' => 'Product type is required and must be a string',
            ];
        }

        try {
            // Ensure the merchant is properly managed by the EntityManager
            if (!$this->entityManager->contains($merchant)) {
                error_log('Merchant not managed by EntityManager, refreshing...');
                $merchant = $this->entityManager->find(User::class, $merchant->getId());
                if (!$merchant) {
                    throw new \Exception('Merchant user not found in database');
                }
            }

            $product = $this->createProductByType($productData['type'], $productData);
            $product->setMerchant($merchant);

            $violations = $this->validator->validate($product);
            if (\count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[$violation->getPropertyPath()] = $violation->getMessage();
                }

                return [
                    'success' => false,
                    'errors' => $errors,
                ];
            }

            $this->entityManager->persist($product);
            $this->entityManager->flush();

            error_log('Product created successfully with ID: ' . $product->getId());

            return [
                'success' => true,
                'product' => $this->formatProduct($product),
            ];
        } catch (\Exception $e) {
            error_log('Product creation failed: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());

            return [
                'success' => false,
                'error' => 'Failed to create product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @param array<string, mixed> $productData
     *
     * @return array{success: bool, error?: string, errors?: array<string, string>, product?: array<string, mixed>}
     */
    public function updateProduct(Product $product, array $productData, User $merchant): array
    {
        if ($product->getMerchant()->getId() !== $merchant->getId()) {
            return [
                'success' => false,
                'error' => 'You can only update your own products',
            ];
        }

        try {
            $this->updateProductData($product, $productData);

            $violations = $this->validator->validate($product);
            if (\count($violations) > 0) {
                $errors = [];
                foreach ($violations as $violation) {
                    $errors[$violation->getPropertyPath()] = $violation->getMessage();
                }

                return [
                    'success' => false,
                    'errors' => $errors,
                ];
            }

            $this->entityManager->flush();

            return [
                'success' => true,
                'product' => $this->formatProduct($product),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to update product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array{success: bool, error?: string}
     */
    public function deleteProduct(Product $product, User $merchant): array
    {
        if ($product->getMerchant()->getId() !== $merchant->getId()) {
            return [
                'success' => false,
                'error' => 'You can only delete your own products',
            ];
        }

        try {
            $this->entityManager->remove($product);
            $this->entityManager->flush();

            return ['success' => true];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to delete product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<array<string, mixed>>
     */
    public function getProductsByMerchant(User $merchant): array
    {
        $products = $this->productRepository->findByMerchant($merchant);

        return array_map(fn (Product $product) => $this->formatProduct($product), $products);
    }

    /**
     * @param array<string, mixed> $filters
     *
     * @return array<array<string, mixed>>
     */
    public function getAllProducts(array $filters = []): array
    {
        if (!empty($filters)) {
            $products = $this->productRepository->findWithFilters($filters);
        } else {
            $products = $this->productRepository->findAvailableProducts();
        }

        return array_map(fn (Product $product) => $this->formatProduct($product), $products);
    }

    public function getProductById(int $id): ?Product
    {
        return $this->productRepository->find($id);
    }

    /**
     * @return array<array<string, mixed>>
     */
    public function searchProducts(string $searchTerm): array
    {
        $products = $this->productRepository->searchProducts($searchTerm);

        return array_map(fn (Product $product) => $this->formatProduct($product), $products);
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function followProduct(Product $product, User $buyer): array
    {
        if (!$buyer->isBuyer()) {
            return [
                'success' => false,
                'error' => 'Only buyers can follow products',
            ];
        }

        $existingFollow = $this->productFollowRepository->findOneBy([
            'product' => $product,
            'user' => $buyer,
        ]);

        if ($existingFollow) {
            return [
                'success' => false,
                'error' => 'You are already following this product',
            ];
        }

        try {
            $follow = new ProductFollow();
            $follow->setProduct($product);
            $follow->setUser($buyer);

            $this->entityManager->persist($follow);
            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Product followed successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to follow product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array{success: bool, error?: string, message?: string}
     */
    public function unfollowProduct(Product $product, User $buyer): array
    {
        $follow = $this->productFollowRepository->findOneBy([
            'product' => $product,
            'user' => $buyer,
        ]);

        if (!$follow) {
            return [
                'success' => false,
                'error' => 'You are not following this product',
            ];
        }

        try {
            $this->entityManager->remove($follow);
            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Product unfollowed successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to unfollow product: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<array<string, mixed>>
     */
    public function getFollowedProducts(User $buyer): array
    {
        $products = $this->productRepository->findFollowedByUser($buyer);

        return array_map(fn (Product $product) => $this->formatProduct($product), $products);
    }

    public function isProductFollowedByUser(Product $product, User $user): bool
    {
        return null !== $this->productFollowRepository->findOneBy([
            'product' => $product,
            'user' => $user,
        ]);
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createProductByType(string $type, array $data): Product
    {
        return match ($type) {
            'motorcycle' => $this->createMotorcycle($data),
            'car' => $this->createCar($data),
            'truck' => $this->createTruck($data),
            'trailer' => $this->createTrailer($data),
            default => throw new \InvalidArgumentException('Invalid vehicle type'),
        };
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createMotorcycle(array $data): Motorcycle
    {
        $motorcycle = new Motorcycle();
        $this->setCommonProductData($motorcycle, $data);

        $engineCapacity = $data['engineCapacity'] ?? '0.00';
        if (is_numeric($engineCapacity)) {
            $motorcycle->setEngineCapacity((string) $engineCapacity);
        } else {
            $motorcycle->setEngineCapacity('0.00');
        }

        return $motorcycle;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createCar(array $data): Car
    {
        $car = new Car();
        $this->setCommonProductData($car, $data);

        $engineCapacity = $data['engineCapacity'] ?? '0.00';
        if (is_numeric($engineCapacity)) {
            $car->setEngineCapacity((string) $engineCapacity);
        } else {
            $car->setEngineCapacity('0.00');
        }

        $numberOfDoors = $data['numberOfDoors'] ?? 4;
        if (\is_int($numberOfDoors) || (\is_string($numberOfDoors) && ctype_digit($numberOfDoors))) {
            $car->setNumberOfDoors((int) $numberOfDoors);
        } else {
            $car->setNumberOfDoors(4);
        }

        if (isset($data['category']) && \is_string($data['category'])) {
            $car->setCategory(CarCategory::from($data['category']));
        }

        return $car;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createTruck(array $data): Truck
    {
        $truck = new Truck();
        $this->setCommonProductData($truck, $data);

        $engineCapacity = $data['engineCapacity'] ?? '0.00';
        if (is_numeric($engineCapacity)) {
            $truck->setEngineCapacity((string) $engineCapacity);
        } else {
            $truck->setEngineCapacity('0.00');
        }

        $numberOfBeds = $data['numberOfBeds'] ?? 1;
        if (\is_int($numberOfBeds) || (\is_string($numberOfBeds) && ctype_digit($numberOfBeds))) {
            $truck->setNumberOfBeds((int) $numberOfBeds);
        } else {
            $truck->setNumberOfBeds(1);
        }

        return $truck;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function createTrailer(array $data): Trailer
    {
        $trailer = new Trailer();
        $this->setCommonProductData($trailer, $data);

        $numberOfAxles = $data['numberOfAxles'] ?? 1;
        if (\is_int($numberOfAxles) || (\is_string($numberOfAxles) && ctype_digit($numberOfAxles))) {
            $trailer->setNumberOfAxles((int) $numberOfAxles);
        } else {
            $trailer->setNumberOfAxles(1);
        }

        $loadCapacity = $data['loadCapacity'] ?? 0;
        if (\is_int($loadCapacity) || (\is_string($loadCapacity) && ctype_digit($loadCapacity))) {
            $trailer->setLoadCapacity((int) $loadCapacity);
        } else {
            $trailer->setLoadCapacity(0);
        }

        return $trailer;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function setCommonProductData(Product $product, array $data): void
    {
        $brand = $data['brand'] ?? '';
        $product->setBrand(\is_string($brand) ? $brand : '');

        $model = $data['model'] ?? '';
        $product->setModel(\is_string($model) ? $model : '');

        $price = $data['price'] ?? '0.00';
        if (is_numeric($price)) {
            $product->setPrice((string) $price);
        } else {
            $product->setPrice('0.00');
        }

        $quantity = $data['quantity'] ?? 0;
        if (\is_int($quantity) || (\is_string($quantity) && ctype_digit($quantity))) {
            $product->setQuantity((int) $quantity);
        } else {
            $product->setQuantity(0);
        }

        $colour = $data['colour'] ?? '';
        $product->setColour(\is_string($colour) ? $colour : '');
    }

    /**
     * @param array<string, mixed> $data
     */
    private function updateProductData(Product $product, array $data): void
    {
        if (isset($data['brand']) && \is_string($data['brand'])) {
            $product->setBrand($data['brand']);
        }

        if (isset($data['model']) && \is_string($data['model'])) {
            $product->setModel($data['model']);
        }

        if (isset($data['price']) && is_numeric($data['price'])) {
            $product->setPrice((string) $data['price']);
        }

        if (isset($data['quantity']) && (\is_int($data['quantity']) || (\is_string($data['quantity']) && ctype_digit($data['quantity'])))) {
            $product->setQuantity((int) $data['quantity']);
        }

        if (isset($data['colour']) && \is_string($data['colour'])) {
            $product->setColour($data['colour']);
        }

        // Update type-specific fields
        if ($product instanceof Motorcycle && isset($data['engineCapacity']) && is_numeric($data['engineCapacity'])) {
            $product->setEngineCapacity((string) $data['engineCapacity']);
        }

        if ($product instanceof Car) {
            if (isset($data['engineCapacity']) && is_numeric($data['engineCapacity'])) {
                $product->setEngineCapacity((string) $data['engineCapacity']);
            }
            if (isset($data['numberOfDoors']) && (\is_int($data['numberOfDoors']) || (\is_string($data['numberOfDoors']) && ctype_digit($data['numberOfDoors'])))) {
                $product->setNumberOfDoors((int) $data['numberOfDoors']);
            }
            if (isset($data['category']) && \is_string($data['category'])) {
                $product->setCategory(CarCategory::from($data['category']));
            }
        }

        if ($product instanceof Truck) {
            if (isset($data['engineCapacity']) && is_numeric($data['engineCapacity'])) {
                $product->setEngineCapacity((string) $data['engineCapacity']);
            }
            if (isset($data['numberOfBeds']) && (\is_int($data['numberOfBeds']) || (\is_string($data['numberOfBeds']) && ctype_digit($data['numberOfBeds'])))) {
                $product->setNumberOfBeds((int) $data['numberOfBeds']);
            }
        }

        if ($product instanceof Trailer) {
            if (isset($data['numberOfAxles']) && (\is_int($data['numberOfAxles']) || (\is_string($data['numberOfAxles']) && ctype_digit($data['numberOfAxles'])))) {
                $product->setNumberOfAxles((int) $data['numberOfAxles']);
            }
            if (isset($data['loadCapacity']) && (\is_int($data['loadCapacity']) || (\is_string($data['loadCapacity']) && ctype_digit($data['loadCapacity'])))) {
                $product->setLoadCapacity((int) $data['loadCapacity']);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function formatProduct(Product $product): array
    {
        $data = [
            'id' => $product->getId(),
            'type' => $product->getVehicleType()->value,
            'brand' => $product->getBrand(),
            'model' => $product->getModel(),
            'price' => $product->getPrice(),
            'quantity' => $product->getQuantity(),
            'colour' => $product->getColour(),
            'merchant' => [
                'id' => $product->getMerchant()->getId(),
                'fullName' => $product->getMerchant()->getFullName(),
                'email' => $product->getMerchant()->getEmail(),
            ],
            'createdAt' => $product->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $product->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'followersCount' => $product->getFollows()->count(),
        ];

        // Add type-specific data
        if ($product instanceof Motorcycle) {
            $data['engineCapacity'] = $product->getEngineCapacity();
        }

        if ($product instanceof Car) {
            $data['engineCapacity'] = $product->getEngineCapacity();
            $data['numberOfDoors'] = $product->getNumberOfDoors();
            $data['category'] = $product->getCategory()->value;
        }

        if ($product instanceof Truck) {
            $data['engineCapacity'] = $product->getEngineCapacity();
            $data['numberOfBeds'] = $product->getNumberOfBeds();
        }

        if ($product instanceof Trailer) {
            $data['numberOfAxles'] = $product->getNumberOfAxles();
            $data['loadCapacity'] = $product->getLoadCapacity();
        }

        return $data;
    }
}
