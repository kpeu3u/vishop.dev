<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Vehicle;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Vehicle>
 *
 * @method Vehicle|null find($id, $lockMode = null, $lockVersion = null)
 * @method Vehicle|null findOneBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null)
 * @method Vehicle[]    findAll()
 * @method Vehicle[]    findBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null, $limit = null, $offset = null)
 */
class VehicleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vehicle::class);
    }

    public function save(Vehicle $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Vehicle $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return Vehicle[] Returns an array of Vehicle objects
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
     * @return Vehicle[] Returns an array of available vehicles (quantity > 0)
     */
    public function findAvailableVehicles(): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.quantity > 0')
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Returns vehicles followed by a specific user.
     *
     * @return Vehicle[]
     */
    public function findFollowedByUser(User $user): array
    {
        /** @var Vehicle[] $result */
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
     * Find vehicles with filters.
     *
     * @param array<string, mixed> $filters
     *
     * @return Vehicle[]
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
     * Search vehicles by brand and model.
     *
     * @return Vehicle[]
     */
    public function searchVehicles(string $searchTerm): array
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
