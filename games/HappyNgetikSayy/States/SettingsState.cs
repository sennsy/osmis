using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public class SettingsState : BaseState
{
    public SettingsState(GameStateManager stateManager, GraphicsDevice graphicsDevice) 
        : base(stateManager, graphicsDevice)
    {
    }

    public override void Update(GameTime gameTime)
    {
        if (InputManager.IsKeyPressed(Keys.Escape) || InputManager.IsKeyPressed(Keys.Enter))
        {
            StateManager.ChangeState(new MenuState(StateManager, GraphicsDevice));
        }
    }

    public override void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        string title = "SETTINGS";
        var titleSize = GameRoot.Font.MeasureString(title);
        spriteBatch.DrawString(GameRoot.Font, title, new Vector2(GameRoot.ScreenWidth / 2 - titleSize.X / 2, 200), Color.Cyan);

        string info = "Settings would go here (e.g. Volume, Difficulty)\n\nPress ENTER or ESC to return.";
        var infoSize = GameRoot.Font.MeasureString(info);
        spriteBatch.DrawString(GameRoot.Font, info, new Vector2(GameRoot.ScreenWidth / 2 - infoSize.X / 2, 300), Color.White);
    }
}
