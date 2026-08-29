using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public class PlayState : BaseState
{
    private PlayerInfo _player;
    private List<TypingObject> _objects;
    private double _spawnTimer;
    private double _spawnInterval = 2.0;
    private Random _random;
    private float _speedMultiplier = 1.0f;
    private TypingObject _activeObject;

    public PlayState(GameStateManager stateManager, GraphicsDevice graphicsDevice) 
        : base(stateManager, graphicsDevice)
    {
        _player = new PlayerInfo();
        _objects = new List<TypingObject>();
        _random = new Random();
        _spawnTimer = 0;
    }

    public override void Update(GameTime gameTime)
    {
        if (InputManager.IsKeyPressed(Keys.Escape))
        {
            StateManager.ChangeState(new PauseState(StateManager, GraphicsDevice, this));
            return;
        }

        _player.TotalSecondsPlayed += gameTime.ElapsedGameTime.TotalSeconds;

        // Difficulty increases over time
        _speedMultiplier = 1.0f + (float)(_player.TotalSecondsPlayed / 60.0); // speeds up over time
        _spawnInterval = Math.Max(0.5, 2.0 - (_player.TotalSecondsPlayed / 60.0)); // spawn faster

        _spawnTimer += gameTime.ElapsedGameTime.TotalSeconds;
        if (_spawnTimer >= _spawnInterval)
        {
            _spawnTimer = 0;
            SpawnWord();
        }

        HandleTyping();

        for (int i = _objects.Count - 1; i >= 0; i--)
        {
            _objects[i].Update(gameTime);
            
            if (_objects[i].Position.Y > GameRoot.ScreenHeight)
            {
                // Reached bottom
                if (_activeObject == _objects[i]) _activeObject = null;
                _objects.RemoveAt(i);
                _player.HP--;
                _player.Combo = 0;
                
                if (_player.HP <= 0)
                {
                    StateManager.ChangeState(new GameOverState(StateManager, GraphicsDevice, _player));
                }
            }
            else if (_objects[i].IsDestroyed)
            {
                if (_activeObject == _objects[i]) _activeObject = null;
                _player.Score += _objects[i].Word.Length * 10 * _player.Multiplier;
                _player.WordsTyped++;
                _objects.RemoveAt(i);
            }
        }
    }

    private void SpawnWord()
    {
        string word = WordManager.GetRandomWord();
        float x = _random.Next(50, GameRoot.ScreenWidth - 200);
        float speed = _random.Next(30, 70) * _speedMultiplier;
        _objects.Add(new TypingObject(word, new Vector2(x, -50), speed));
    }

    private void HandleTyping()
    {
        var keys = InputManager.GetPressedKeys();
        foreach (var key in keys)
        {
            char c = GetCharFromKey(key);
            if (c != '\0')
            {
                _player.TotalKeystrokes++;
                bool hit = false;

                if (_activeObject != null)
                {
                    if (_activeObject.TypeLetter(c))
                    {
                        hit = true;
                    }
                }
                else
                {
                    // Find a new active object
                    foreach (var obj in _objects)
                    {
                        if (obj.TypeLetter(c))
                        {
                            hit = true;
                            _activeObject = obj;
                            break;
                        }
                    }
                }

                if (hit)
                {
                    _player.CorrectKeystrokes++;
                    _player.Combo++;
                    if (_player.Combo > _player.MaxCombo) _player.MaxCombo = _player.Combo;
                }
                else
                {
                    _player.Combo = 0; // Reset combo if wrong key
                }
            }
        }
    }

    private char GetCharFromKey(Keys key)
    {
        if (key >= Keys.A && key <= Keys.Z)
        {
            return key.ToString()[0];
        }
        if (key == Keys.Space) return ' ';
        if (key == Keys.OemMinus) return '-';
        return '\0';
    }

    public override void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        // Draw character at bottom center
        Vector2 charPos = new Vector2(GameRoot.ScreenWidth / 2 - 50, GameRoot.ScreenHeight - 150);
        if (GameRoot.SelectedPlayerTex != null)
        {
            Rectangle dest = new Rectangle((int)charPos.X, (int)charPos.Y, 100, 150);
            spriteBatch.Draw(GameRoot.SelectedPlayerTex, dest, Color.White);
        }

        // Draw laser if there is an active object
        if (_activeObject != null && !_activeObject.IsDestroyed)
        {
            Vector2 start = new Vector2(GameRoot.ScreenWidth / 2, GameRoot.ScreenHeight - 100);
            // Point to the center of the active word (approx)
            Vector2 end = new Vector2(_activeObject.Position.X + 30, _activeObject.Position.Y + 15);
            
            DrawLaser(spriteBatch, start, end, Color.Red);
        }

        // Draw Words
        foreach (var obj in _objects)
        {
            obj.Draw(spriteBatch, GameRoot.Font);
        }

        // Draw HUD
        spriteBatch.Draw(GameRoot.Pixel, new Rectangle(0, 0, GameRoot.ScreenWidth, 40), Color.Black * 0.8f);
        string hud = $"HP: {_player.HP}   Score: {_player.Score}   Combo: {_player.Combo} (x{_player.Multiplier})   WPM: {_player.WPM}   Acc: {_player.Accuracy:0.0}%";
        spriteBatch.DrawString(GameRoot.Font, hud, new Vector2(20, 10), Color.White);
        
        string exitInst = "ESC to Pause";
        Vector2 instSize = GameRoot.Font.MeasureString(exitInst);
        spriteBatch.DrawString(GameRoot.Font, exitInst, new Vector2(GameRoot.ScreenWidth - instSize.X - 20, 10), Color.Gray);
    }

    private void DrawLaser(SpriteBatch spriteBatch, Vector2 start, Vector2 end, Color color)
    {
        Vector2 edge = end - start;
        float angle = (float)Math.Atan2(edge.Y, edge.X);
        spriteBatch.Draw(GameRoot.Pixel,
            new Rectangle((int)start.X, (int)start.Y, (int)edge.Length(), 5), // thickness 5
            null,
            color,
            angle,
            new Vector2(0, 0.5f),
            SpriteEffects.None,
            0);
    }
}
