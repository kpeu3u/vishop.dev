<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!\is_array($data)) {
            return $this->json(['error' => 'Invalid JSON'], 400);
        }

        $user = new User();

        // Validate and set email
        $email = $data['email'] ?? '';
        if (!\is_string($email)) {
            return $this->json(['error' => 'Email must be a string'], 400);
        }
        $user->setEmail($email);

        // Validate and set full name
        $fullName = $data['fullName'] ?? '';
        if (!\is_string($fullName)) {
            return $this->json(['error' => 'Full name must be a string'], 400);
        }
        $user->setFullName($fullName);

        // Set roles
        if (isset($data['roles']) && \is_array($data['roles'])) {
            // Validate that all roles are strings
            $roles = [];
            foreach ($data['roles'] as $role) {
                if (!\is_string($role)) {
                    return $this->json(['error' => 'All roles must be strings'], 400);
                }
                $roles[] = $role;
            }
            $user->setRoles($roles);
        } else {
            $user->setRoles([User::ROLE_BUYER]); // Default role
        }

        // Hash password
        if (isset($data['password'])) {
            $password = $data['password'];
            if (!\is_string($password)) {
                return $this->json(['error' => 'Password must be a string'], 400);
            }
            $hashedPassword = $passwordHasher->hashPassword($user, $password);
            $user->setPassword($hashedPassword);
        }

        // Validate user
        $errors = $validator->validate($user);
        if (\count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }

            return $this->json(['errors' => $errorMessages], 400);
        }

        try {
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'message' => 'User created successfully',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'fullName' => $user->getFullName(),
                    'roles' => $user->getRoles(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Registration failed'], 500);
        }
    }

    #[Route(path: '/login', name: 'api_login', methods: ['POST'])]
    public function login(): Response
    {
        // This method is handled by the JSON login authenticator
        // The actual login logic is in the security configuration
        // This method will never be executed because JWT handles it

        return new JsonResponse([
            'message' => 'Login endpoint - should not reach here',
        ], 400);
    }

    #[Route(path: '/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
