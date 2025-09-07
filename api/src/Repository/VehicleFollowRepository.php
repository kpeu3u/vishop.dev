<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Vehicle;
use App\Entity\VehicleFollow;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<VehicleFollow>
 *
 * @method VehicleFollow|null find($id, $lockMode = null, $lockVersion = null)
 * @method VehicleFollow|null findOneBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null)
 * @method VehicleFollow[]    findAll()
 * @method VehicleFollow[]    findBy(array<string, mixed> $criteria, ?array<string, string> $orderBy = null, $limit = null, $offset = null)
 */
class VehicleFollowRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VehicleFollow::class);
    }

    public function save(VehicleFollow $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(VehicleFollow $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findFollowByUserAndVehicle(User $user, Vehicle $vehicle): ?VehicleFollow
    {
        return $this->findOneBy(['user' => $user, 'vehicle' => $vehicle]);
    }

    public function isVehicleFollowedByUser(User $user, Vehicle $vehicle): bool
    {
        return null !== $this->findFollowByUserAndVehicle($user, $vehicle);
    }

    /**
     * @return VehicleFollow[] Returns an array of VehicleFollow objects for a user
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

    public function countFollowersForVehicle(Vehicle $vehicle): int
    {
        $result = $this->createQueryBuilder('pf')
            ->select('COUNT(pf.id)')
            ->andWhere('pf.vehicle = :vehicle')
            ->setParameter('vehicle', $vehicle)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }
}
