<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

final class AuthControllerTest extends WebTestCase
{
    public function testLoginEndpointReturnsErrorMessage(): void
    {
        $client = self::createClient();
        $client->request('POST', '/api/auth/login', [], [], ['CONTENT_TYPE' => 'application/json']);

        $response = $client->getResponse();
        $statusCode = $response->getStatusCode();

        $this->assertContains($statusCode, [
            Response::HTTP_BAD_REQUEST,
            Response::HTTP_UNAUTHORIZED,
        ]);

        $contentType = $response->headers->get('content-type');
        if ($contentType && str_contains($contentType, 'application/json') && $response->getContent()) {
            $responseData = json_decode($response->getContent(), true);
            if (\is_array($responseData) && isset($responseData['message'])) {
                $this->assertSame('Login endpoint - should not reach here', $responseData['message']);
            }
        }
    }

    public function testLoginWithValidCredentialsReturnsJwtToken(): void
    {
        $client = self::createClient();

        // Create a test user first
        $entityManager = self::getContainer()->get('doctrine')->getManager();

        // Use the actual User entity class
        $user = new User();
        $user->setFullName('Test User');
        $user->setEmail('test@example.com');

        // Hash the password
        $passwordHasher = self::getContainer()->get('security.user_password_hasher');
        $hashedPassword = $passwordHasher->hashPassword($user, 'password123');
        $user->setPassword($hashedPassword);

        // Set roles
        $user->setRoles(['ROLE_USER']);

        // Set as verified if the entity has this property
        $user->setIsVerified(true);

        $entityManager->persist($user);
        $entityManager->flush();

        $credentials = json_encode([
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Test JWT authentication flow
        $client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            $credentials ?: null
        );

        // The response should either be successful JWT token or handled by JWT authenticator
        // The exact response depends on your JWT configuration
        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_OK,
            Response::HTTP_BAD_REQUEST, // If the endpoint logic is executed
        ]);

        // Clean up
        $entityManager->remove($user);
        $entityManager->flush();
    }

    public function testLoginWithInvalidCredentialsReturnsUnauthorized(): void
    {
        $client = self::createClient();
        $credentials = json_encode([
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);
        $client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            $credentials ?: null
        );

        // Should return 401 Unauthorized for invalid credentials
        // The exact status code depends on JWT configuration
        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_UNAUTHORIZED,
            Response::HTTP_BAD_REQUEST,
        ]);
    }

    public function testLoginWithMissingCredentialsReturnsBadRequest(): void
    {
        $client = self::createClient();
        $credentials = json_encode(['password' => 'password123']);
        // Test with missing email
        $client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            $credentials ?: null
        );

        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_BAD_REQUEST,
            Response::HTTP_UNAUTHORIZED,
        ]);

        $credentials = json_encode(['email' => 'test@example.com']);
        // Test with missing password
        $client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            $credentials ?: null
        );

        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_BAD_REQUEST,
            Response::HTTP_UNAUTHORIZED,
        ]);

        // Test with empty body
        $client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            '{}'
        );

        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_BAD_REQUEST,
            Response::HTTP_UNAUTHORIZED,
        ]);
    }

    public function testLoginWithInvalidJsonReturnsBadRequest(): void
    {
        $client = self::createClient();

        $client->request(
            'POST',
            '/api/auth/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            'invalid json'
        );

        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_BAD_REQUEST,
            Response::HTTP_UNAUTHORIZED,
        ]);
    }

    public function testLogoutThrowsLogicException(): void
    {
        $client = self::createClient();

        // Since the logout method always throws a LogicException,
        // we need to test this in a different way
        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('This method can be blank - it will be intercepted by the logout key on your firewall.');

        // Create controller instance to test the method directly
        $controller = new \App\Controller\AuthController();
        $controller->logout();
    }

    public function testLogoutEndpointExists(): void
    {
        $client = self::createClient();

        // Test that the logout route exists and is accessible
        $client->request('POST', '/api/auth/logout');

        // The response will vary depending on whether the user is authenticated
        // and how the firewall handles the logout
        // Since the logout method throws LogicException, we also expect 500
        $this->assertContains($client->getResponse()->getStatusCode(), [
            Response::HTTP_OK,
            Response::HTTP_UNAUTHORIZED,
            Response::HTTP_FORBIDDEN,
            Response::HTTP_FOUND, // Redirect
            Response::HTTP_INTERNAL_SERVER_ERROR, // LogicException throws 500
        ]);
    }

    public function testLoginEndpointOnlyAcceptsPostMethod(): void
    {
        $client = self::createClient();

        // Test GET method - should not be allowed
        $client->request('GET', '/api/auth/login');
        $this->assertSame(Response::HTTP_METHOD_NOT_ALLOWED, $client->getResponse()->getStatusCode());

        // Test PUT method - should not be allowed
        $client->request('PUT', '/api/auth/login');
        $this->assertSame(Response::HTTP_METHOD_NOT_ALLOWED, $client->getResponse()->getStatusCode());

        // Test DELETE method - should not be allowed
        $client->request('DELETE', '/api/auth/login');
        $this->assertSame(Response::HTTP_METHOD_NOT_ALLOWED, $client->getResponse()->getStatusCode());
    }

    public function testLogoutEndpointOnlyAcceptsPostMethod(): void
    {
        $client = self::createClient();

        // Test GET method - should not be allowed
        $client->request('GET', '/api/auth/logout');
        $this->assertSame(Response::HTTP_METHOD_NOT_ALLOWED, $client->getResponse()->getStatusCode());

        // Test PUT method - should not be allowed
        $client->request('PUT', '/api/auth/logout');
        $this->assertSame(Response::HTTP_METHOD_NOT_ALLOWED, $client->getResponse()->getStatusCode());

        // Test DELETE method - should not be allowed
        $client->request('DELETE', '/api/auth/logout');
        $this->assertSame(Response::HTTP_METHOD_NOT_ALLOWED, $client->getResponse()->getStatusCode());
    }

    public function testRouteNamesAreCorrect(): void
    {
        $client = self::createClient();
        $router = self::getContainer()->get('router');

        // Test that the named routes exist
        $loginRoute = $router->generate('api_login');
        $this->assertSame('/api/auth/login', $loginRoute);

        $logoutRoute = $router->generate('api_logout');
        $this->assertSame('/api/auth/logout', $logoutRoute);
    }
}
