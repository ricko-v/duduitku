<?php

namespace App\Ai;

use App\Models\User;

class UserContext
{
    protected ?User $user = null;

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }
}
