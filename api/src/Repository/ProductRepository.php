<?php

namespace App\Repository;

use App\Entity\Product;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 *
 * @method Product|null find($id, $lockMode = null, $lockVersion = null)
 * @method Product|null findOneBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null)
 * @method Product[]    findAll()
 * @method Product[]    findBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null, $limit = null, $offset = null)
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    public function save(Product $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Product $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return Product[] Returns an array of Product objects
     */
    public function findByMerchant(User $merchant): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.merchant = :merchant')
            ->setParameter('merchant', $merchant)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Product[] Returns an array of available products (quantity > 0)
     */
    public function findAvailableProducts(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.quantity > 0')
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Returns products followed by a specific user.
     *
     * @return Product[]
     */
    public function findFollowedByUser(User $user): array
    {
        /** @var Product[] $result */
        $result = $this->createQueryBuilder('p')
            ->innerJoin('p.follows', 'f')
            ->andWhere('f.user = :user')
            ->setParameter('user', $user)
            ->orderBy('f.followedAt', 'DESC')
            ->getQuery()
            ->getResult();

        return $result;
    }

    /**
     * Find products with filters.
     *
     * @param array<string, mixed> $filters
     *
     * @return Product[]
     */
    public function findWithFilters(array $filters): array
    {
        $qb = $this->createQueryBuilder('p');

        $this->applyCriteria($qb, $filters);

        return $qb->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search products by brand and model.
     *
     * @return Product[]
     */
    public function searchProducts(string $searchTerm): array
    {
        $qb = $this->createQueryBuilder('p');

        return $qb
            ->where($qb->expr()->orX(
                $qb->expr()->like('LOWER(p.brand)', ':searchTerm'),
                $qb->expr()->like('LOWER(p.model)', ':searchTerm')
            ))
            ->andWhere('p.quantity > 0')
            ->setParameter('searchTerm', '%' . mb_strtolower($searchTerm) . '%')
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Apply filter criteria to query builder.
     *
     * @param array<string, mixed> $criteria
     */
    private function applyCriteria(QueryBuilder $qb, array $criteria): void
    {
        if (!empty($criteria['brand']) && \is_string($criteria['brand'])) {
            $qb->andWhere('LOWER(p.brand) LIKE LOWER(:brand)')
                ->setParameter('brand', '%' . $criteria['brand'] . '%');
        }

        if (!empty($criteria['model']) && \is_string($criteria['model'])) {
            $qb->andWhere('LOWER(p.model) LIKE LOWER(:model)')
                ->setParameter('model', '%' . $criteria['model'] . '%');
        }

        if (!empty($criteria['colour']) && \is_string($criteria['colour'])) {
            $qb->andWhere('LOWER(p.colour) LIKE LOWER(:colour)')
                ->setParameter('colour', '%' . $criteria['colour'] . '%');
        }

        if (!empty($criteria['minPrice'])) {
            $qb->andWhere('p.price >= :minPrice')
                ->setParameter('minPrice', $criteria['minPrice']);
        }

        if (!empty($criteria['maxPrice'])) {
            $qb->andWhere('p.price <= :maxPrice')
                ->setParameter('maxPrice', $criteria['maxPrice']);
        }

        if (isset($criteria['inStock']) && $criteria['inStock']) {
            $qb->andWhere('p.quantity > 0');
        }
    }
}
