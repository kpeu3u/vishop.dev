<?php

namespace App\Tests\Controller;

use App\Entity\Car;
use App\Entity\User;
use App\Entity\VehicleFollow;
use App\Enum\CarCategory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class VehicleControllerTest extends WebTestCase
{
    private EntityManagerInterface $entityManager;

    protected function tearDown(): void
    {
        if (isset($this->entityManager)) {
            // Clean up test data after each test
            $this->entityManager->createQuery('DELETE FROM App\Entity\VehicleFollow')->execute();
            $this->entityManager->createQuery('DELETE FROM App\Entity\Vehicle')->execute();
            $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
        }

        parent::tearDown();
    }

    private function getEntityManager(): EntityManagerInterface
    {
        if (!isset($this->entityManager)) {
            $this->entityManager = self::getContainer()->get('doctrine')->getManager();
        }

        return $this->entityManager;
    }

    private function createTestUser(string $email = 'test@example.com', array $roles = ['ROLE_BUYER']): User
    {
        $user = new User();
        $user->setEmail($email);
        $user->setFullName('Test User');
        $user->setRoles($roles);
        $user->setIsVerified(true);

        $passwordHasher = self::getContainer()->get('security.user_password_hasher');
        $hashedPassword = $passwordHasher->hashPassword($user, 'password123');
        $user->setPassword($hashedPassword);

        $em = $this->getEntityManager();
        $em->persist($user);
        $em->flush();

        return $user;
    }

    private function createTestVehicle(User $merchant, array $data = []): Car
    {
        $vehicle = new Car();
        $vehicle->setBrand($data['brand'] ?? 'Toyota');
        $vehicle->setModel($data['model'] ?? 'Camry');
        $vehicle->setPrice($data['price'] ?? '25000.00');
        $vehicle->setQuantity($data['quantity'] ?? 1);
        $vehicle->setMerchant($merchant);
        $vehicle->setCategory($data['category'] ?? CarCategory::SEDAN);

        // Set required properties from EngineVehicleTrait
        $vehicle->setEngineCapacity($data['engineCapacity'] ?? '2.50');

        // Set required properties from ColouredVehicleTrait
        $vehicle->setColour($data['colour'] ?? 'Black');

        // Set required properties from PermittedMaxMassVehicleTrait
        $vehicle->setPermittedMaximumMass($data['permittedMaximumMass'] ?? 1500);

        // Set required Car-specific properties
        $vehicle->setNumberOfDoors($data['numberOfDoors'] ?? 4);

        $em = $this->getEntityManager();
        $em->persist($vehicle);
        $em->flush();

        return $vehicle;
    }

    private function authenticateUser(User $user): array
    {
        // Create JWT token for the user
        $jwtManager = self::getContainer()->get('lexik_jwt_authentication.jwt_manager');
        $token = $jwtManager->create($user);

        return ['HTTP_AUTHORIZATION' => 'Bearer ' . $token];
    }

    public function testListVehiclesReturnsSuccessResponse(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);

        // Create test vehicles
        $this->createTestVehicle($merchant, ['brand' => 'Toyota', 'model' => 'Camry']);
        $this->createTestVehicle($merchant, ['brand' => 'Honda', 'model' => 'Civic']);

        $client->request('GET', '/api/vehicles');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($response);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testListVehiclesWithFilterParameters(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);

        $this->createTestVehicle($merchant, ['brand' => 'Toyota']);
        $this->createTestVehicle($merchant, ['brand' => 'Honda']);

        $client->request('GET', '/api/vehicles', ['brand' => 'Toyota']);

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testSearchVehiclesReturnsSuccessResponse(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);

        $this->createTestVehicle($merchant, ['brand' => 'Toyota', 'model' => 'Camry']);

        $client->request('GET', '/api/vehicles/search', ['q' => 'Toyota']);

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testSearchVehiclesWithInvalidQueryReturnsBadRequest(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/vehicles/search');

        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertFalse($response['success'] ?? true);
        $this->assertArrayHasKey('error', $response);
    }

    public function testShowVehicleReturnsSuccessResponse(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $vehicle = $this->createTestVehicle($merchant);

        $client->request('GET', '/api/vehicles/' . $vehicle->getId());

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testShowNonExistentVehicleReturnsNotFound(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/vehicles/99999');

        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertFalse($response['success'] ?? true);
    }

    public function testShowVehicleWithInvalidIdReturnsBadRequest(): void
    {
        $client = self::createClient();

        $client->request('GET', '/api/vehicles/invalid');

        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testCreateVehicleWithMerchantRoleReturnsCreated(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $vehicleData = [
            'type' => 'car',
            'brand' => 'BMW',
            'model' => 'X5',
            'price' => '45000.00',
            'quantity' => 2,
            'category' => 'limousine',
        ];

        $client->request(
            'POST',
            '/api/vehicles',
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($vehicleData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testCreateVehicleWithoutMerchantRoleReturnsForbidden(): void
    {
        $client = self::createClient();
        $buyer = $this->createTestUser('buyer@example.com', ['ROLE_BUYER']);
        $headers = $this->authenticateUser($buyer);

        $vehicleData = [
            'brand' => 'BMW',
            'model' => 'X5',
            'price' => '45000.00',
            'quantity' => 2,
            'type' => 'car',
        ];

        $client->request(
            'POST',
            '/api/vehicles',
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($vehicleData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testCreateVehicleWithoutAuthenticationReturnsUnauthorized(): void
    {
        $client = self::createClient();

        $vehicleData = [
            'brand' => 'BMW',
            'model' => 'X5',
            'price' => '45000.00',
            'quantity' => 2,
        ];

        $client->request(
            'POST',
            '/api/vehicles',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($vehicleData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCreateVehicleWithInvalidDataReturnsUnprocessableEntity(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $invalidData = [
            'type' => 'car',
            'brand' => 'BMW',
            'model' => 'X5',
            'price' => -100,
            'quantity' => 2,
            'category' => 'suv',
        ];

        $client->request(
            'POST',
            '/api/vehicles',
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($invalidData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertFalse($response['success'] ?? true);
        $this->assertArrayHasKey('errors', $response);

        $this->assertArrayHasKey('price', $response['errors']);
        $this->assertStringContainsString('positive', mb_strtolower($response['errors']['price']));
    }

    public function testCreateVehicleWithMissingRequiredFieldsReturnsUnprocessableEntity(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $incompleteData = [
            // Missing required fields like 'type', 'brand', 'model', 'quantity'
            'price' => '25000.00',
        ];

        $client->request(
            'POST',
            '/api/vehicles',
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($incompleteData)
        );

        // Missing required fields are validation errors, so 422 is correct
        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertFalse($response['success'] ?? true);
        $this->assertArrayHasKey('errors', $response);

        // Verify we get specific errors for missing required fields
        $this->assertArrayHasKey('type', $response['errors']);
        $this->assertArrayHasKey('brand', $response['errors']);
        $this->assertArrayHasKey('model', $response['errors']);
        $this->assertArrayHasKey('quantity', $response['errors']);
    }

    public function testUpdateVehicleWithMerchantRoleReturnsSuccess(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $vehicle = $this->createTestVehicle($merchant);
        $headers = $this->authenticateUser($merchant);

        $updateData = [
            'brand' => 'Updated Toyota',
            'model' => 'Updated Camry',
            'price' => '30000.00',
        ];

        $client->request(
            'PUT',
            '/api/vehicles/' . $vehicle->getId(),
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($updateData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testUpdateNonExistentVehicleReturnsNotFound(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $updateData = ['brand' => 'Updated Brand'];

        $client->request(
            'PUT',
            '/api/vehicles/99999',
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($updateData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testDeleteVehicleWithMerchantRoleReturnsSuccess(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $vehicle = $this->createTestVehicle($merchant);
        $headers = $this->authenticateUser($merchant);

        $client->request(
            'DELETE',
            '/api/vehicles/' . $vehicle->getId(),
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testDeleteNonExistentVehicleReturnsNotFound(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $client->request(
            'DELETE',
            '/api/vehicles/99999',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testMyVehiclesWithMerchantRoleReturnsVehicles(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $this->createTestVehicle($merchant);
        $this->createTestVehicle($merchant, ['brand' => 'Honda', 'model' => 'Civic']);
        $headers = $this->authenticateUser($merchant);

        $client->request(
            'GET',
            '/api/vehicles/my-vehicles',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testMyVehiclesWithoutMerchantRoleReturnsForbidden(): void
    {
        $client = self::createClient();
        $buyer = $this->createTestUser('buyer@example.com', ['ROLE_BUYER']);
        $headers = $this->authenticateUser($buyer);

        $client->request(
            'GET',
            '/api/vehicles/my-vehicles',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testFollowVehicleWithBuyerRoleReturnsSuccess(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $buyer = $this->createTestUser('buyer@example.com', ['ROLE_BUYER']);
        $vehicle = $this->createTestVehicle($merchant);
        $headers = $this->authenticateUser($buyer);

        $client->request(
            'POST',
            '/api/vehicles/' . $vehicle->getId() . '/follow',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testFollowVehicleWithoutBuyerRoleReturnsForbidden(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $vehicle = $this->createTestVehicle($merchant);
        $headers = $this->authenticateUser($merchant);

        $client->request(
            'POST',
            '/api/vehicles/' . $vehicle->getId() . '/follow',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testFollowNonExistentVehicleReturnsNotFound(): void
    {
        $client = self::createClient();
        $buyer = $this->createTestUser('buyer@example.com', ['ROLE_BUYER']);
        $headers = $this->authenticateUser($buyer);

        $client->request(
            'POST',
            '/api/vehicles/99999/follow',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testUnfollowVehicleWithBuyerRoleReturnsSuccess(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $buyer = $this->createTestUser('buyer@example.com', ['ROLE_BUYER']);
        $vehicle = $this->createTestVehicle($merchant);

        // Create a follow relationship first
        $follow = new VehicleFollow();
        $follow->setUser($buyer);
        $follow->setVehicle($vehicle);
        $em = $this->getEntityManager();
        $em->persist($follow);
        $em->flush();

        $headers = $this->authenticateUser($buyer);

        $client->request(
            'DELETE',
            '/api/vehicles/' . $vehicle->getId() . '/unfollow',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testFollowedVehiclesWithBuyerRoleReturnsFollowedVehicles(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $buyer = $this->createTestUser('buyer@example.com', ['ROLE_BUYER']);
        $vehicle = $this->createTestVehicle($merchant);

        // Create a follow relationship
        $follow = new VehicleFollow();
        $follow->setUser($buyer);
        $follow->setVehicle($vehicle);
        $em = $this->getEntityManager();
        $em->persist($follow);
        $em->flush();

        $headers = $this->authenticateUser($buyer);

        $client->request(
            'GET',
            '/api/vehicles/followed',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testFollowedVehiclesWithoutBuyerRoleReturnsForbidden(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $client->request(
            'GET',
            '/api/vehicles/followed',
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testCreateVehicleWithInvalidJsonReturnsBadRequest(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $headers = $this->authenticateUser($merchant);

        $client->request(
            'POST',
            '/api/vehicles',
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            'invalid json'
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertFalse($response['success'] ?? true);
    }

    public function testUpdateVehicleWithPatchMethodReturnsSuccess(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $vehicle = $this->createTestVehicle($merchant);
        $headers = $this->authenticateUser($merchant);

        $updateData = ['price' => '35000.00'];

        $client->request(
            'PATCH',
            '/api/vehicles/' . $vehicle->getId(),
            [],
            [],
            array_merge(['CONTENT_TYPE' => 'application/json'], $headers),
            json_encode($updateData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($response['success'] ?? false);
    }

    public function testRouteNamesAreCorrect(): void
    {
        $client = self::createClient();
        $router = self::getContainer()->get('router');

        // Test that all named routes exist
        $this->assertSame('/api/vehicles', $router->generate('api_vehicle_list'));
        $this->assertSame('/api/vehicles/search', $router->generate('api_vehicle_search'));
        $this->assertSame('/api/vehicles/1', $router->generate('api_vehicle_show', ['id' => 1]));
        $this->assertSame('/api/vehicles', $router->generate('api_vehicle_create'));
        $this->assertSame('/api/vehicles/1', $router->generate('api_vehicle_update', ['id' => 1]));
        $this->assertSame('/api/vehicles/1', $router->generate('api_vehicle_delete', ['id' => 1]));
        $this->assertSame('/api/vehicles/my-vehicles', $router->generate('api_vehicle_my_vehicles'));
        $this->assertSame('/api/vehicles/1/follow', $router->generate('api_vehicle_follow', ['id' => 1]));
        $this->assertSame('/api/vehicles/1/unfollow', $router->generate('api_vehicle_unfollow', ['id' => 1]));
        $this->assertSame('/api/vehicles/followed', $router->generate('api_vehicle_followed'));
    }

    public function testVehicleEndpointsOnlyAcceptCorrectHttpMethods(): void
    {
        $client = self::createClient();
        $merchant = $this->createTestUser('merchant@example.com', ['ROLE_MERCHANT']);
        $vehicle = $this->createTestVehicle($merchant);
        $headers = $this->authenticateUser($merchant);

        $client->request('POST', '/api/vehicles');
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED); // Because POST /api/vehicles requires auth

        $client->request('POST', '/api/vehicles/' . $vehicle->getId());
        $this->assertResponseStatusCodeSame(Response::HTTP_METHOD_NOT_ALLOWED); // show endpoint doesn't require auth

        $client->request('POST', '/api/vehicles/search');
        $this->assertResponseStatusCodeSame(Response::HTTP_METHOD_NOT_ALLOWED); // search endpoint doesn't require auth

        $client->request(
            'PUT',
            '/api/vehicles',
            [],
            [],
            $headers
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_METHOD_NOT_ALLOWED);

        $client->request(
            'POST',
            '/api/vehicles/' . $vehicle->getId(),
            [],
            [],
            $headers
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_METHOD_NOT_ALLOWED);

        $client->request(
            'GET',
            '/api/vehicles/' . $vehicle->getId() . '/follow',
            [],
            [],
            $headers
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_METHOD_NOT_ALLOWED);

        $client->request(
            'GET',
            '/api/vehicles/' . $vehicle->getId() . '/unfollow',
            [],
            [],
            $headers
        );
        $this->assertResponseStatusCodeSame(Response::HTTP_METHOD_NOT_ALLOWED);

        $client->request('GET', '/api/vehicles');
        $this->assertResponseStatusCodeSame(Response::HTTP_OK); // list endpoint

        $client->request('GET', '/api/vehicles/' . $vehicle->getId());
        $this->assertResponseStatusCodeSame(Response::HTTP_OK); // show endpoint

        $client->request('GET', '/api/vehicles/search', ['q' => 'test']);
        $this->assertResponseStatusCodeSame(Response::HTTP_OK); // search endpoint
    }
}
