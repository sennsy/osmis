using System.IO;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public class GameRoot : Game
{
    private GraphicsDeviceManager _graphics;
    private SpriteBatch _spriteBatch;
    private GameStateManager _gameStateManager;

    public static SpriteFont Font { get; private set; }
    public static Texture2D Pixel { get; private set; }
    public static Texture2D UltramanTex { get; private set; }
    public static Texture2D SpidermanTex { get; private set; }
    public static Texture2D BatmanTex { get; private set; }
    public static Texture2D SelectedPlayerTex { get; set; }
    
    public const int ScreenWidth = 1280;
    public const int ScreenHeight = 720;

    public GameRoot()
    {
        _graphics = new GraphicsDeviceManager(this);
        Content.RootDirectory = "Content";
        IsMouseVisible = true;
        
        _graphics.PreferredBackBufferWidth = ScreenWidth;
        _graphics.PreferredBackBufferHeight = ScreenHeight;
        _graphics.ApplyChanges();
    }

    protected override void Initialize()
    {
        base.Initialize();
        _gameStateManager = new GameStateManager(this);
        _gameStateManager.ChangeState(new MenuState(_gameStateManager, GraphicsDevice));
    }

    protected override void LoadContent()
    {
        _spriteBatch = new SpriteBatch(GraphicsDevice);
        Font = Content.Load<SpriteFont>("Font");
        
        Pixel = new Texture2D(GraphicsDevice, 1, 1);
        Pixel.SetData(new[] { Color.White });

        using (var stream = TitleContainer.OpenStream("Assets/ultraman.png"))
            UltramanTex = Texture2D.FromStream(GraphicsDevice, stream);

        using (var stream = TitleContainer.OpenStream("Assets/spiderman.png"))
            SpidermanTex = Texture2D.FromStream(GraphicsDevice, stream);

        using (var stream = TitleContainer.OpenStream("Assets/batman.png"))
            BatmanTex = Texture2D.FromStream(GraphicsDevice, stream);
            
        SelectedPlayerTex = UltramanTex;
    }

    protected override void Update(GameTime gameTime)
    {
        InputManager.Update();
        
        _gameStateManager.Update(gameTime);
        
        base.Update(gameTime);
    }

    protected override void Draw(GameTime gameTime)
    {
        GraphicsDevice.Clear(new Color(20, 20, 25));
        
        _spriteBatch.Begin(SpriteSortMode.Deferred, BlendState.AlphaBlend);
        _gameStateManager.Draw(gameTime, _spriteBatch);
        _spriteBatch.End();

        base.Draw(gameTime);
    }
}
