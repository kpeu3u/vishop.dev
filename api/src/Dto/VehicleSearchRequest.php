<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class VehicleSearchRequest
{
    #[Assert\NotBlank(message: 'Search term is required')]
    #[Assert\Length(min: 2, max: 50, minMessage: 'Search term must be at least {{ limit }} characters', maxMessage: 'Search term cannot be longer than {{ limit }} characters')]
    public string $q;
}
