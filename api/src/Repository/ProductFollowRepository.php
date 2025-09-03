<?php

namespace App\Repository;

use App\Entity\Product;
use App\Entity\ProductFollow;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProductFollow>
 *
 * @method ProductFollow|null find($id, $lockMode = null, $lockVersion = null)
 * @method ProductFollow|null findOneBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null)
 * @method ProductFollow[]    findAll()
 * @method ProductFollow[]    findBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null, $limit = null, $offset = null)
 */
class ProductFollowRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProductFollow::class);
    }

    public function save(ProductFollow $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ProductFollow $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findFollowByUserAndProduct(User $user, Product $product): ?ProductFollow
    {
        return $this->findOneBy(['user' => $user, 'product' => $product]);
    }

    public function isProductFollowedByUser(User $user, Product $product): bool
    {
        return null !== $this->findFollowByUserAndProduct($user, $product);
    }

    /**
     * @return ProductFollow[] Returns an array of ProductFollow objects for a user
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('pf')
            ->andWhere('pf.user = :user')
            ->setParameter('user', $user)
            ->orderBy('pf.followedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countFollowersForProduct(Product $product): int
    {
        $result = $this->createQueryBuilder('pf')
            ->select('COUNT(pf.id)')
            ->andWhere('pf.product = :product')
            ->setParameter('product', $product)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }
}
