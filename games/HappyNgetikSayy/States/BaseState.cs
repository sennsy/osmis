using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace HappyNgetikSayy;

public abstract class BaseState
{
    protected GameStateManager StateManager;
    protected GraphicsDevice GraphicsDevice;

    public BaseState(GameStateManager stateManager, GraphicsDevice graphicsDevice)
    {
        StateManager = stateManager;
        GraphicsDevice = graphicsDevice;
    }

    public abstract void Update(GameTime gameTime);
    public abstract void Draw(GameTime gameTime, SpriteBatch spriteBatch);
}
