using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace WongTersakitiBross
{
    public static class Globals
    {
        public static float TotalSeconds { get; set; }
        public static GraphicsDevice GraphicsDevice { get; set; }
        public static SpriteBatch SpriteBatch { get; set; }
        public static Texture2D Pixel { get; set; }
        public static SpriteFont Font { get; set; }

        public static Texture2D UltramanTex { get; set; }
        public static Texture2D SpidermanTex { get; set; }
        public static Texture2D BatmanTex { get; set; }
        public static Texture2D SelectedPlayerTex { get; set; }

        public static void Init(GraphicsDevice gd)
        {
            GraphicsDevice = gd;
            Pixel = new Texture2D(gd, 1, 1);
            Pixel.SetData(new[] { Color.White });
        }
    }

    public static class InputManager
    {
        private static KeyboardState _currentKey;
        private static KeyboardState _previousKey;

        public static void Update()
        {
            _previousKey = _currentKey;
            _currentKey = Keyboard.GetState();
        }

        public static bool IsKeyPressed(Keys key)
        {
            return _currentKey.IsKeyDown(key) && _previousKey.IsKeyUp(key);
        }

        public static bool IsKeyDown(Keys key)
        {
            return _currentKey.IsKeyDown(key);
        }
    }

    public class Camera
    {
        public Matrix Transform { get; private set; }
        public Vector2 Position { get; private set; }
        private readonly int _viewportWidth;
        private readonly int _viewportHeight;

        public Camera(int viewportWidth, int viewportHeight)
        {
            _viewportWidth = viewportWidth;
            _viewportHeight = viewportHeight;
            Position = Vector2.Zero;
        }

        public void Follow(Vector2 targetPosition, int mapWidth)
        {
            // Horizontal follow with dead zone
            float targetX = targetPosition.X - (_viewportWidth / 2f);
            
            // Clamp camera to map bounds (0 to mapWidth - viewportWidth)
            targetX = MathHelper.Clamp(targetX, 0, mapWidth - _viewportWidth);

            // Lerp for smooth camera (optional, but requested simple follow is fine)
            Position = new Vector2(targetX, 0);

            Transform = Matrix.CreateTranslation(
                new Vector3(-Position.X, -Position.Y, 0));
        }
    }
}
