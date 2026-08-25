using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;

namespace WongTersakitiBross
{
    public abstract class Entity
    {
        public Vector2 Position;
        public Vector2 Velocity;
        public int Width;
        public int Height;
        public Color Color;
        public bool IsActive = true;

        public Rectangle Bounds => new Rectangle((int)Position.X, (int)Position.Y, Width, Height);

        public Entity(Vector2 position, int width, int height, Color color)
        {
            Position = position;
            Width = width;
            Height = height;
            Color = color;
        }

        public abstract void Update(Level level);

        public virtual void Draw()
        {
            if (IsActive)
            {
                Globals.SpriteBatch.Draw(Globals.Pixel, Bounds, Color);
            }
        }
    }

    public class Platform : Entity
    {
        public Platform(Vector2 position, int width, int height, Color color) 
            : base(position, width, height, color) { }

        public override void Update(Level level) { }
    }

    public class Coin : Entity
    {
        public Coin(Vector2 position) : base(position, 20, 20, Color.Yellow) { }

        public override void Update(Level level) { }
        
        public override void Draw()
        {
            if (IsActive)
            {
                // Draw as a smaller centered square for a coin
                var rect = new Rectangle(Bounds.X + 4, Bounds.Y + 4, 12, 12);
                Globals.SpriteBatch.Draw(Globals.Pixel, rect, Color);
            }
        }
    }

    public class Checkpoint : Entity
    {
        public bool IsReached = false;
        
        public Checkpoint(Vector2 position) : base(position, 40, 80, Color.Orange) { }

        public override void Update(Level level) { }
        
        public override void Draw()
        {
            if (IsActive)
            {
                Globals.SpriteBatch.Draw(Globals.Pixel, Bounds, IsReached ? Color.Green : Color.Orange);
            }
        }
    }

    public class Goal : Entity
    {
        public Goal(Vector2 position) : base(position, 60, 100, Color.Cyan) { }

        public override void Update(Level level) { }
    }

    public class Enemy : Entity
    {
        public float Speed = 100f;
        public int StartX;
        public int PatrolDistance = 200;
        public int Direction = 1;

        public Enemy(Vector2 position) : base(position, 40, 40, Color.Red) 
        { 
            StartX = (int)position.X;
        }

        public override void Update(Level level)
        {
            if (!IsActive) return;

            Velocity.X = Direction * Speed;
            Velocity.Y += 1000f * Globals.TotalSeconds; // Gravity

            Position.X += Velocity.X * Globals.TotalSeconds;
            
            // Check horizontal bounds (patrol)
            if (Position.X > StartX + PatrolDistance)
            {
                Position.X = StartX + PatrolDistance;
                Direction = -1;
            }
            else if (Position.X < StartX - PatrolDistance)
            {
                Position.X = StartX - PatrolDistance;
                Direction = 1;
            }

            // Collisions
            foreach (var platform in level.Platforms)
            {
                if (Bounds.Intersects(platform.Bounds))
                {
                    // Basic floor collision
                    if (Velocity.Y > 0 && Position.Y + Height - Velocity.Y * Globals.TotalSeconds <= platform.Position.Y)
                    {
                        Position.Y = platform.Position.Y - Height;
                        Velocity.Y = 0;
                    }
                }
            }
        }
    }

    public class Player : Entity
    {
        private float _speed = 300f;
        private float _jumpForce = -600f;
        private float _gravity = 1500f;
        private bool _isGrounded = false;
        private bool _isDead = false;

        public Player(Vector2 position) : base(position, 30, 50, Color.Blue) { }

        public void Die(Level level)
        {
            _isDead = true;
            IsActive = false;
            level.OnPlayerDeath();
        }

        public override void Update(Level level)
        {
            if (_isDead) return;

            Velocity.X = 0;

            if (InputManager.IsKeyDown(Keys.Left) || InputManager.IsKeyDown(Keys.A))
                Velocity.X = -_speed;
            if (InputManager.IsKeyDown(Keys.Right) || InputManager.IsKeyDown(Keys.D))
                Velocity.X = _speed;

            if ((InputManager.IsKeyPressed(Keys.Up) || InputManager.IsKeyPressed(Keys.W) || InputManager.IsKeyPressed(Keys.Space)) && _isGrounded)
            {
                Velocity.Y = _jumpForce;
                _isGrounded = false;
            }

            Velocity.Y += _gravity * Globals.TotalSeconds;

            // Apply horizontal
            Position.X += Velocity.X * Globals.TotalSeconds;
            
            // Resolve X collisions
            Rectangle playerBounds = Bounds;
            foreach (var platform in level.Platforms)
            {
                if (playerBounds.Intersects(platform.Bounds))
                {
                    if (Velocity.X > 0) Position.X = platform.Position.X - Width;
                    else if (Velocity.X < 0) Position.X = platform.Position.X + platform.Width;
                }
            }

            // Apply vertical
            Position.Y += Velocity.Y * Globals.TotalSeconds;
            _isGrounded = false;

            // Resolve Y collisions
            playerBounds = Bounds;
            foreach (var platform in level.Platforms)
            {
                if (playerBounds.Intersects(platform.Bounds))
                {
                    if (Velocity.Y > 0)
                    {
                        Position.Y = platform.Position.Y - Height;
                        Velocity.Y = 0;
                        _isGrounded = true;
                    }
                    else if (Velocity.Y < 0)
                    {
                        Position.Y = platform.Position.Y + platform.Height;
                        Velocity.Y = 0;
                    }
                }
            }

            // Fall off bottom
            if (Position.Y > 1000)
            {
                Die(level);
                return;
            }

            // Entity interactions
            playerBounds = Bounds;
            
            for (int i = level.Coins.Count - 1; i >= 0; i--)
            {
                if (level.Coins[i].IsActive && playerBounds.Intersects(level.Coins[i].Bounds))
                {
                    level.Coins[i].IsActive = false;
                    level.AddScore(100);
                }
            }

            foreach (var enemy in level.Enemies)
            {
                if (enemy.IsActive && playerBounds.Intersects(enemy.Bounds))
                {
                    // Check if falling on enemy
                    if (Velocity.Y > 0 && Position.Y + Height - Velocity.Y * Globals.TotalSeconds <= enemy.Position.Y + 10)
                    {
                        enemy.IsActive = false;
                        Velocity.Y = _jumpForce * 0.7f; // Bounce
                        level.AddScore(200);
                    }
                    else
                    {
                        Die(level);
                        return;
                    }
                }
            }

            foreach (var cp in level.Checkpoints)
            {
                if (!cp.IsReached && playerBounds.Intersects(cp.Bounds))
                {
                    cp.IsReached = true;
                    level.LastCheckpointPosition = cp.Position;
                }
            }

            if (level.LevelGoal.IsActive && playerBounds.Intersects(level.LevelGoal.Bounds))
            {
                level.CompleteLevel();
            }
        }
    }
}
