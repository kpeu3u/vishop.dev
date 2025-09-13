<?php

namespace App\Tests\Unit\Controller;

use App\Controller\VehicleController;
use App\Entity\Car;
use App\Service\RequestValidationService;
use App\Service\VehicleService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class VehicleControllerUnitTest extends TestCase
{
    private VehicleService&MockObject $vehicleService;
    private RequestValidationService&MockObject $requestValidationService;

    protected function setUp(): void
    {
        $this->vehicleService = $this->createMock(VehicleService::class);
        $this->requestValidationService = $this->createMock(RequestValidationService::class);
    }

    private function createControllerWithMockedContainer(): VehicleController
    {
        $controller = new VehicleController(
            $this->vehicleService,
            $this->requestValidationService
        );

        $container = $this->createMock(\Symfony\Component\DependencyInjection\ContainerInterface::class);

        $serializer = $this->createMock(\Symfony\Component\Serializer\SerializerInterface::class);
        $serializer->method('serialize')->willReturnCallback(function ($data, $format) {
            return json_encode($data);
        });

        $container->method('has')->willReturnMap([
            ['serializer', true],
            ['security.token_storage', false],
        ]);

        $container->method('get')->willReturnMap([
            ['serializer', $serializer],
        ]);

        $reflection = new \ReflectionClass($controller);
        $containerProperty = $reflection->getProperty('container');
        $containerProperty->setValue($controller, $container);

        return $controller;
    }

    public function testListValidationLogic(): void
    {
        $request = new Request();

        $this->requestValidationService
            ->expects($this->once())
            ->method('validateQueryFilters')
            ->with($request)
            ->willReturn(['success' => false, 'error' => 'Invalid parameters']);

        $this->vehicleService
            ->expects($this->never())
            ->method('handleVehicleList');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->list($request);

        $this->assertSame(400, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Invalid parameters', $content['error']);
    }

    public function testListSuccessLogic(): void
    {
        $request = new Request();

        $this->requestValidationService
            ->expects($this->once())
            ->method('validateQueryFilters')
            ->with($request)
            ->willReturn(['success' => true]);

        $this->vehicleService
            ->expects($this->once())
            ->method('handleVehicleList')
            ->with($request)
            ->willReturn(['success' => true, 'data' => []]);

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->list($request);

        $this->assertSame(200, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertTrue($content['success']);
    }

    public function testListValidationErrorsReturn422(): void
    {
        $request = new Request();

        $this->requestValidationService
            ->expects($this->once())
            ->method('validateQueryFilters')
            ->with($request)
            ->willReturn(['success' => false, 'errors' => ['field' => 'error message']]);

        $this->vehicleService
            ->expects($this->never())
            ->method('handleVehicleList');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->list($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(422, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertArrayHasKey('errors', $content);
    }

    public function testSearchValidationLogic(): void
    {
        $request = new Request();

        $this->requestValidationService
            ->expects($this->once())
            ->method('validateSearchQuery')
            ->with($request)
            ->willReturn(['success' => false, 'error' => 'Missing search query']);

        $this->vehicleService
            ->expects($this->never())
            ->method('handleVehicleSearch');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->search($request);

        $this->assertSame(400, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Missing search query', $content['error']);
    }

    public function testUpdateVehicleNotFoundLogic(): void
    {
        $vehicleId = 999;
        $request = new Request();

        $this->vehicleService
            ->expects($this->once())
            ->method('getVehicleById')
            ->with($vehicleId)
            ->willReturn(null);

        $this->requestValidationService
            ->expects($this->never())
            ->method('validateJsonRequest');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->update($vehicleId, $request);
        $this->assertSame(404, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Vehicle not found', $content['error']);
    }

    public function testUpdateJsonValidationFailureLogic(): void
    {
        $vehicleId = 1;
        $request = new Request();
        $vehicle = new Car();

        $this->vehicleService
            ->expects($this->once())
            ->method('getVehicleById')
            ->with($vehicleId)
            ->willReturn($vehicle);

        $this->requestValidationService
            ->expects($this->once())
            ->method('validateJsonRequest')
            ->with($request)
            ->willReturn(['success' => false, 'error' => 'Invalid JSON']);

        $this->requestValidationService
            ->expects($this->never())
            ->method('validateVehicleUpdateData');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->update($vehicleId, $request);

        $this->assertSame(400, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Invalid JSON', $content['error']);
    }

    public function testDeleteVehicleNotFoundLogic(): void
    {
        $vehicleId = 999;

        $this->vehicleService
            ->expects($this->once())
            ->method('getVehicleById')
            ->with($vehicleId)
            ->willReturn(null);

        $this->vehicleService
            ->expects($this->never())
            ->method('handleVehicleDeletion');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->delete($vehicleId);

        $this->assertSame(404, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Vehicle not found', $content['error']);
    }

    public function testFollowVehicleNotFoundLogic(): void
    {
        $vehicleId = 999;

        $this->vehicleService
            ->expects($this->once())
            ->method('getVehicleById')
            ->with($vehicleId)
            ->willReturn(null);

        $this->vehicleService
            ->expects($this->never())
            ->method('handleVehicleFollowAction');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->follow($vehicleId);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(404, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Vehicle not found', $content['error']);
    }

    public function testUnfollowVehicleNotFoundLogic(): void
    {
        $vehicleId = 999;

        $this->vehicleService
            ->expects($this->once())
            ->method('getVehicleById')
            ->with($vehicleId)
            ->willReturn(null);

        $this->vehicleService
            ->expects($this->never())
            ->method('handleVehicleFollowAction');

        $controller = $this->createControllerWithMockedContainer();
        $response = $controller->unfollow($vehicleId);

        $this->assertSame(404, $response->getStatusCode());

        $content = json_decode($response->getContent(), true);
        $this->assertFalse($content['success']);
        $this->assertSame('Vehicle not found', $content['error']);
    }

    /**
     * @throws \ReflectionException
     */
    public function testStatusCodeDetermination(): void
    {
        $controller = $this->createControllerWithMockedContainer();

        $reflection = new \ReflectionClass($controller);
        $method = $reflection->getMethod('determineStatusCode');

        $result = ['success' => true];
        $statusCode = $method->invoke($controller, $result, 200);
        $this->assertSame(200, $statusCode);

        $result = ['success' => false, 'error' => 'Vehicle not found'];
        $statusCode = $method->invoke($controller, $result, 200);
        $this->assertSame(404, $statusCode);

        $result = ['success' => false, 'errors' => ['field' => 'error']];
        $statusCode = $method->invoke($controller, $result, 200);
        $this->assertSame(422, $statusCode);

        $result = ['success' => false, 'error' => 'Generic error'];
        $statusCode = $method->invoke($controller, $result, 200);
        $this->assertSame(400, $statusCode);
    }
}
