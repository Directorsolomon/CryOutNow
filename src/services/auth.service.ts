static async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    try {
      const connection = await db.getConnection();

      const existingUser = await connection('users').where({ email }).first();
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      if (!password || password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }

      if (!displayName || displayName.length < 2) {
        throw new AppError('Display name must be at least 2 characters', 400);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const [user] = await connection('users')
        .insert({
          email,
          password_hash: passwordHash,
          display_name: displayName,
        })
        .returning(['id', 'email', 'display_name', 'photo_url']);

      if (!user) {
        throw new AppError('Failed to create user', 500);
      }

      return {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoUrl: user.photo_url,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Unexpected error during registration:', error);
      throw new AppError('Failed to create account. Please try again.', 500);
    }
  }