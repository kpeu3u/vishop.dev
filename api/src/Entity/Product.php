<?php

namespace App\Entity;

use App\Enum\VehicleType;
use App\Repository\ProductRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'products')]
#[ORM\InheritanceType('SINGLE_TABLE')]
#[ORM\DiscriminatorColumn(name: 'vehicle_type', type: 'string')]
#[ORM\DiscriminatorMap([
    'motorcycle' => Motorcycle::class,
    'car' => Car::class,
    'truck' => Truck::class,
    'trailer' => Trailer::class,
])]
abstract class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: Types::INTEGER)]
    private ?int $id = null;

    #[ORM\Column(type: Types::STRING, length: 100, nullable: false)]
    #[Assert\NotBlank(message: 'Brand is required')]
    #[Assert\Length(max: 100)]
    private string $brand;

    #[ORM\Column(type: Types::STRING, length: 100, nullable: false)]
    #[Assert\NotBlank(message: 'Model is required')]
    #[Assert\Length(max: 100)]
    private string $model;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: false)]
    #[Assert\NotBlank(message: 'Price is required')]
    #[Assert\Positive(message: 'Price must be positive')]
    #[Assert\Type(type: 'numeric', message: 'Price must be a number')]
    private string $price;

    #[ORM\Column(type: Types::INTEGER, nullable: false)]
    #[Assert\NotBlank(message: 'Quantity is required')]
    #[Assert\PositiveOrZero(message: 'Quantity must be zero or positive')]
    #[Assert\Type(type: 'integer', message: 'Quantity must be an integer')]
    private int $quantity;

    #[ORM\Column(type: Types::STRING, length: 50, nullable: false)]
    #[Assert\NotBlank(message: 'Colour is required')]
    #[Assert\Length(max: 50)]
    private string $colour;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $merchant;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTime $updatedAt = null;

    /**
     * @var Collection<int, ProductFollow>
     */
    #[ORM\OneToMany(targetEntity: ProductFollow::class, mappedBy: 'product', cascade: ['remove'])]
    private Collection $follows;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->follows = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBrand(): string
    {
        return $this->brand;
    }

    public function setBrand(string $brand): self
    {
        $this->brand = $brand;

        return $this;
    }

    public function getModel(): string
    {
        return $this->model;
    }

    public function setModel(string $model): self
    {
        $this->model = $model;

        return $this;
    }

    public function getPrice(): string
    {
        return $this->price;
    }

    public function setPrice(string $price): self
    {
        $this->price = $price;

        return $this;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): self
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getColour(): string
    {
        return $this->colour;
    }

    public function setColour(string $colour): self
    {
        $this->colour = $colour;

        return $this;
    }

    public function getMerchant(): User
    {
        return $this->merchant;
    }

    public function setMerchant(User $merchant): self
    {
        $this->merchant = $merchant;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection<int, ProductFollow>
     */
    public function getFollows(): Collection
    {
        return $this->follows;
    }

    public function addFollow(ProductFollow $follow): self
    {
        if (!$this->follows->contains($follow)) {
            $this->follows->add($follow);
            $follow->setProduct($this);
        }

        return $this;
    }

    public function removeFollow(ProductFollow $follow): self
    {
        $this->follows->removeElement($follow);

        return $this;
    }

    public function getVehicleType(): VehicleType
    {
        return match (static::class) {
            Motorcycle::class => VehicleType::MOTORCYCLE,
            Car::class => VehicleType::CAR,
            Truck::class => VehicleType::TRUCK,
            Trailer::class => VehicleType::TRAILER,
            default => throw new \InvalidArgumentException('Unknown vehicle type'),
        };
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }
}
