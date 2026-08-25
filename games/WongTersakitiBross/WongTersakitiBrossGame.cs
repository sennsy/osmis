using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace WongTersakitiBross
{
    public class WongTersakitiBrossGame : Game
    {
        private GraphicsDeviceManager _graphics;
        private SpriteBatch _spriteBatch;

        private GameState _currentState;
        private Level _currentLevel;
        private Camera _camera;

        public WongTersakitiBrossGame()
        {
            _graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;

            _graphics.PreferredBackBufferWidth = 1280;
            _graphics.PreferredBackBufferHeight = 720;
        }

        protected override void Initialize()
        {
            _currentState = GameState.MainMenu;
            _camera = new Camera(_graphics.PreferredBackBufferWidth, _graphics.PreferredBackBufferHeight);
            
            base.Initialize();
        }

        protected override void LoadContent()
        {
            _spriteBatch = new SpriteBatch(GraphicsDevice);
            Globals.Init(GraphicsDevice);
            Globals.SpriteBatch = _spriteBatch;
        }

        protected override void Update(GameTime gameTime)
        {
            Globals.TotalSeconds = (float)gameTime.ElapsedGameTime.TotalSeconds;
            InputManager.Update();

            if (InputManager.IsKeyPressed(Keys.Escape))
            {
                if (_currentState == GameState.Playing)
                    _currentState = GameState.Paused;
                else if (_currentState == GameState.Paused)
                    _currentState = GameState.Playing;
            }

            switch (_currentState)
            {
                case GameState.MainMenu:
                    if (InputManager.IsKeyPressed(Keys.Enter))
                    {
                        StartGame();
                    }
                    break;

                case GameState.Playing:
                    _currentLevel.Update();
                    _camera.Follow(_currentLevel.LevelPlayer.Position, _currentLevel.MapWidth);

                    if (_currentLevel.IsGameOver)
                    {
                        _currentState = GameState.GameOver;
                    }
                    else if (_currentLevel.IsLevelComplete)
                    {
                        _currentState = GameState.LevelComplete;
                    }
                    break;

                case GameState.GameOver:
                case GameState.LevelComplete:
                    if (InputManager.IsKeyPressed(Keys.Enter))
                    {
                        _currentState = GameState.MainMenu;
                    }
                    break;
            }

            base.Update(gameTime);
        }

        private void StartGame()
        {
            _currentLevel = new Level();
            _currentState = GameState.Playing;
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);

            if (_currentState == GameState.Playing || _currentState == GameState.Paused)
            {
                // Draw Game World with Camera
                _spriteBatch.Begin(transformMatrix: _camera.Transform);
                _currentLevel.Draw();
                _spriteBatch.End();

                // Draw UI
                _spriteBatch.Begin();
                DrawUI();
                
                if (_currentState == GameState.Paused)
                {
                    MiniFont.DrawText(_spriteBatch, "PAUSED", new Vector2(550, 300), Color.White, 8);
                }
                
                _spriteBatch.End();
            }
            else
            {
                _spriteBatch.Begin();
                if (_currentState == GameState.MainMenu)
                {
                    MiniFont.DrawText(_spriteBatch, "WONG TERSAKITI BROSS", new Vector2(300, 200), Color.White, 6);
                    MiniFont.DrawText(_spriteBatch, "PRESS ENTER TO START", new Vector2(400, 400), Color.White, 4);
                    MiniFont.DrawText(_spriteBatch, "ARROWS JUMP AND MOVE", new Vector2(400, 450), Color.LightGray, 3);
                }
                else if (_currentState == GameState.GameOver)
                {
                    MiniFont.DrawText(_spriteBatch, "GAME OVER", new Vector2(450, 200), Color.Red, 8);
                    MiniFont.DrawText(_spriteBatch, "PRESS ENTER TO MENU", new Vector2(400, 400), Color.White, 4);
                }
                else if (_currentState == GameState.LevelComplete)
                {
                    MiniFont.DrawText(_spriteBatch, "LEVEL COMPLETE", new Vector2(350, 200), Color.Yellow, 8);
                    MiniFont.DrawText(_spriteBatch, $"SCORE: {_currentLevel.Score}", new Vector2(500, 350), Color.White, 4);
                    MiniFont.DrawText(_spriteBatch, "PRESS ENTER TO MENU", new Vector2(400, 450), Color.White, 4);
                }
                _spriteBatch.End();
            }

            base.Draw(gameTime);
        }

        private void DrawUI()
        {
            MiniFont.DrawText(_spriteBatch, $"SCORE: {_currentLevel.Score}", new Vector2(20, 20), Color.White, 4);
            MiniFont.DrawText(_spriteBatch, $"COINS: {_currentLevel.CoinsCollected}", new Vector2(20, 50), Color.Yellow, 4);
            MiniFont.DrawText(_spriteBatch, $"LIVES: {_currentLevel.Lives}", new Vector2(300, 20), Color.Red, 4);
            MiniFont.DrawText(_spriteBatch, $"TIME: {(int)_currentLevel.TimeLeft}", new Vector2(600, 20), Color.White, 4);
        }
    }
}
