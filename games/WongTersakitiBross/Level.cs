using Microsoft.Xna.Framework;
using System.Collections.Generic;

namespace WongTersakitiBross
{
    public class Level
    {
        public List<Platform> Platforms { get; private set; }
        public List<Coin> Coins { get; private set; }
        public List<Enemy> Enemies { get; private set; }
        public List<Checkpoint> Checkpoints { get; private set; }
        public Goal LevelGoal { get; private set; }
        
        public Player LevelPlayer { get; private set; }
        public Vector2 LastCheckpointPosition { get; set; }
        
        public int Score { get; private set; }
        public int CoinsCollected { get; private set; }
        public int Lives { get; set; } = 3;
        public float TimeLeft { get; private set; } = 300f;
        public int MapWidth { get; private set; }

        public bool IsGameOver { get; private set; }
        public bool IsLevelComplete { get; private set; }

        public Level(int levelNum = 1)
        {
            Platforms = new List<Platform>();
            Coins = new List<Coin>();
            Enemies = new List<Enemy>();
            Checkpoints = new List<Checkpoint>();

            LoadLevel(levelNum);
        }

        private void LoadLevel(int levelNum)
        {
            MapWidth = 4000;
            LastCheckpointPosition = new Vector2(100, 500);

            // Ground
            Platforms.Add(new Platform(new Vector2(0, 650), 1200, 100, Color.DarkGreen));
            Platforms.Add(new Platform(new Vector2(1400, 650), 800, 100, Color.DarkGreen));
            Platforms.Add(new Platform(new Vector2(2400, 650), 1600, 100, Color.DarkGreen));

            // Floating platforms
            Platforms.Add(new Platform(new Vector2(400, 500), 200, 30, Color.SaddleBrown));
            Platforms.Add(new Platform(new Vector2(700, 400), 200, 30, Color.SaddleBrown));
            Platforms.Add(new Platform(new Vector2(1000, 300), 200, 30, Color.SaddleBrown));
            
            // Coins
            Coins.Add(new Coin(new Vector2(480, 450)));
            Coins.Add(new Coin(new Vector2(780, 350)));
            Coins.Add(new Coin(new Vector2(1080, 250)));
            
            // Enemies
            float speedMult = 1f + (levelNum - 1) * 0.3f;
            Enemies.Add(new Enemy(new Vector2(600, 610)) { Speed = 100f * speedMult });
            Enemies.Add(new Enemy(new Vector2(1600, 610)) { Speed = 100f * speedMult });
            Enemies.Add(new Enemy(new Vector2(2800, 610)) { Speed = 100f * speedMult });
            Enemies.Add(new Enemy(new Vector2(3200, 610)) { Speed = 100f * speedMult });
            
            if (levelNum > 1) {
                for (int i = 0; i < levelNum; i++) {
                    Enemies.Add(new Enemy(new Vector2(2500 + i*100, 610)) { Speed = 120f * speedMult });
                }
            }

            // Checkpoints
            Checkpoints.Add(new Checkpoint(new Vector2(1500, 570)));

            // Goal
            LevelGoal = new Goal(new Vector2(3800, 550));

            RespawnPlayer();
        }

        public void RespawnPlayer()
        {
            LevelPlayer = new Player(LastCheckpointPosition);
        }

        public void OnPlayerDeath()
        {
            Lives--;
            if (Lives <= 0)
            {
                IsGameOver = true;
            }
            else
            {
                RespawnPlayer();
            }
        }

        public void CompleteLevel()
        {
            IsLevelComplete = true;
        }

        public void AddScore(int amount)
        {
            Score += amount;
            if (amount == 100) CoinsCollected++; // specific to coin score right now for simplicity
        }

        public void Update()
        {
            if (IsGameOver || IsLevelComplete) return;

            TimeLeft -= Globals.TotalSeconds;
            if (TimeLeft <= 0)
            {
                TimeLeft = 0;
                LevelPlayer.Die(this);
            }

            LevelPlayer.Update(this);

            foreach (var enemy in Enemies)
                enemy.Update(this);
        }

        public void Draw()
        {
            foreach (var platform in Platforms)
                platform.Draw();

            foreach (var cp in Checkpoints)
                cp.Draw();

            LevelGoal.Draw();

            foreach (var coin in Coins)
                coin.Draw();

            foreach (var enemy in Enemies)
                enemy.Draw();

            LevelPlayer.Draw();
        }
    }
}
