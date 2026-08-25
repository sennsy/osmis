using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace HappyNgetikSayy;

public class GameStateManager
{
    private BaseState _currentState;
    public GameRoot Game { get; private set; }

    public GameStateManager(GameRoot game)
    {
        Game = game;
    }

    public void ChangeState(BaseState newState)
    {
        _currentState = newState;
    }

    public void Update(GameTime gameTime)
    {
        _currentState?.Update(gameTime);
    }

    public void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        _currentState?.Draw(gameTime, spriteBatch);
    }
}
