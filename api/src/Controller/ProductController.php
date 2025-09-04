<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\ProductService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/products', name: 'api_product_')]
class ProductController extends AbstractController
{
    public function __construct(
        private readonly ProductService $productService,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filters = [];

        if ($request->query->has('brand')) {
            $filters['brand'] = $request->query->get('brand');
        }
        if ($request->query->has('model')) {
            $filters['model'] = $request->query->get('model');
        }
        if ($request->query->has('minPrice')) {
            $filters['minPrice'] = $request->query->get('minPrice');
        }
        if ($request->query->has('maxPrice')) {
            $filters['maxPrice'] = $request->query->get('maxPrice');
        }
        if ($request->query->has('inStock')) {
            $filters['inStock'] = $request->query->getBoolean('inStock');
        }

        $products = $this->productService->getAllProducts($filters);

        return $this->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    #[Route('/search', name: 'search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->query->get('q', '');

        if (empty($searchTerm)) {
            return $this->json([
                'success' => false,
                'error' => 'Search term is required',
            ], 400);
        }

        $products = $this->productService->searchProducts($searchTerm);

        return $this->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    #[Route('/{id}', name: 'show', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $product = $this->productService->getProductById($id);

        if (!$product) {
            return $this->json([
                'success' => false,
                'error' => 'Product not found',
            ], 404);
        }

        $productData = $this->productService->formatProduct($product);

        // Add follow status if user is authenticated and is a buyer
        $user = $this->getUser();
        if ($user instanceof User && $user->isBuyer()) {
            $productData['isFollowed'] = $this->productService->isProductFollowedByUser($product, $user);
        }

        return $this->json([
            'success' => true,
            'product' => $productData,
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_MERCHANT')] // Re-enable this
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user - not authenticated properly',
            ], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!$this->isValidProductData($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data or non-string keys',
            ], 400);
        }

        /** @var array<string, mixed> $data */
        $result = $this->productService->createProduct($data, $user);

        return $this->json($result, $result['success'] ? 201 : 400);
    }

    #[Route('/{id}', name: 'update', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $product = $this->productService->getProductById($id);

        if (!$product) {
            return $this->json([
                'success' => false,
                'error' => 'Product not found',
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!$this->isValidProductData($data)) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid JSON data or non-string keys',
            ], 400);
        }

        /** @var array<string, mixed> $data */
        $result = $this->productService->updateProduct($product, $data, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/{id}', name: 'delete', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['DELETE'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $product = $this->productService->getProductById($id);

        if (!$product) {
            return $this->json([
                'success' => false,
                'error' => 'Product not found',
            ], 404);
        }

        $result = $this->productService->deleteProduct($product, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/my-products', name: 'my_products', methods: ['GET'])]
    #[IsGranted('ROLE_MERCHANT')]
    public function myProducts(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $products = $this->productService->getProductsByMerchant($user);

        return $this->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    #[Route('/{id}/follow', name: 'follow', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['POST'])]
    #[IsGranted('ROLE_BUYER')]
    public function follow(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $product = $this->productService->getProductById($id);

        if (!$product) {
            return $this->json([
                'success' => false,
                'error' => 'Product not found',
            ], 404);
        }

        $result = $this->productService->followProduct($product, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/{id}/unfollow', name: 'unfollow', requirements: ['id' => Requirement::POSITIVE_INT], methods: ['DELETE'])]
    #[IsGranted('ROLE_BUYER')]
    public function unfollow(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $product = $this->productService->getProductById($id);

        if (!$product) {
            return $this->json([
                'success' => false,
                'error' => 'Product not found',
            ], 404);
        }

        $result = $this->productService->unfollowProduct($product, $user);

        return $this->json($result, $result['success'] ? 200 : 400);
    }

    #[Route('/followed', name: 'followed', methods: ['GET'])]
    #[IsGranted('ROLE_BUYER')]
    public function followedProducts(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json([
                'success' => false,
                'error' => 'Invalid user',
            ], 401);
        }

        $products = $this->productService->getFollowedProducts($user);

        return $this->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    /**
     * Validates that the data is an associative array with string keys.
     */
    private function isValidProductData(mixed $data): bool
    {
        if (!\is_array($data)) {
            return false;
        }

        // Check if all keys are strings (associative array)
        foreach (array_keys($data) as $key) {
            if (!\is_string($key)) {
                return false;
            }
        }

        return true;
    }
}
