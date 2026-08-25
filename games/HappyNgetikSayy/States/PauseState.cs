using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public class PauseState : BaseState
{
    private PlayState _playState;

    public PauseState(GameStateManager stateManager, GraphicsDevice graphicsDevice, PlayState playState) 
        : base(stateManager, graphicsDevice)
    {
        _playState = playState;
    }

    public override void Update(GameTime gameTime)
    {
        if (InputManager.IsKeyPressed(Keys.Escape) || InputManager.IsKeyPressed(Keys.Enter))
        {
            StateManager.ChangeState(_playState); // Resume
        }
        if (InputManager.IsKeyPressed(Keys.Q))
        {
            StateManager.ChangeState(new MenuState(StateManager, GraphicsDevice)); // Quit to Menu
        }
    }

    public override void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        // Draw the play state in background
        _playState.Draw(gameTime, spriteBatch);

        // Overlay
        spriteBatch.Draw(GameRoot.Pixel, new Rectangle(0, 0, GameRoot.ScreenWidth, GameRoot.ScreenHeight), Color.Black * 0.7f);

        string title = "PAUSED";
        var titleSize = GameRoot.Font.MeasureString(title);
        spriteBatch.DrawString(GameRoot.Font, title, new Vector2(GameRoot.ScreenWidth / 2 - titleSize.X / 2, 250), Color.Yellow);

        string info = "Press ESC or ENTER to Resume\nPress Q to Quit to Menu";
        var infoSize = GameRoot.Font.MeasureString(info);
        spriteBatch.DrawString(GameRoot.Font, info, new Vector2(GameRoot.ScreenWidth / 2 - infoSize.X / 2, 350), Color.White);
    }
}
