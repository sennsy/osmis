using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public class GameOverState : BaseState
{
    private PlayerInfo _player;

    public GameOverState(GameStateManager stateManager, GraphicsDevice graphicsDevice, PlayerInfo player) 
        : base(stateManager, graphicsDevice)
    {
        _player = player;
    }

    public override void Update(GameTime gameTime)
    {
        if (InputManager.IsKeyPressed(Keys.Enter) || InputManager.IsKeyPressed(Keys.Escape))
        {
            StateManager.ChangeState(new MenuState(StateManager, GraphicsDevice));
        }
    }

    public override void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        string title = "GAME OVER";
        var titleSize = GameRoot.Font.MeasureString(title);
        spriteBatch.DrawString(GameRoot.Font, title, new Vector2(GameRoot.ScreenWidth / 2 - titleSize.X / 2, 200), Color.Red);

        string stats = $"Final Score: {_player.Score}\n" +
                       $"Max Combo: {_player.MaxCombo}\n" +
                       $"Words Typed: {_player.WordsTyped}\n" +
                       $"WPM: {_player.WPM}\n" +
                       $"Accuracy: {_player.Accuracy:0.0}%\n\n" +
                       $"Press ENTER to return to Menu";
                       
        var statsSize = GameRoot.Font.MeasureString(stats);
        spriteBatch.DrawString(GameRoot.Font, stats, new Vector2(GameRoot.ScreenWidth / 2 - statsSize.X / 2, 300), Color.White);
    }
}
