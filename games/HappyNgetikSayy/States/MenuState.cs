using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public class MenuState : BaseState
{
    private string[] _menuItems = { "Play", "Settings", "Exit" };
    private int _selectedIndex = 0;

    public MenuState(GameStateManager stateManager, GraphicsDevice graphicsDevice) 
        : base(stateManager, graphicsDevice)
    {
    }

    public override void Update(GameTime gameTime)
    {
        if (InputManager.IsKeyPressed(Keys.Up) || InputManager.IsKeyPressed(Keys.W))
        {
            _selectedIndex--;
            if (_selectedIndex < 0) _selectedIndex = _menuItems.Length - 1;
        }
        if (InputManager.IsKeyPressed(Keys.Down) || InputManager.IsKeyPressed(Keys.S))
        {
            _selectedIndex++;
            if (_selectedIndex >= _menuItems.Length) _selectedIndex = 0;
        }

        if (InputManager.IsKeyPressed(Keys.Enter))
        {
            if (_selectedIndex == 0) // Play
            {
                StateManager.ChangeState(new PlayState(StateManager, GraphicsDevice));
            }
            else if (_selectedIndex == 1) // Settings
            {
                StateManager.ChangeState(new SettingsState(StateManager, GraphicsDevice));
            }
            else if (_selectedIndex == 2) // Exit
            {
                StateManager.Game.Exit();
            }
        }
    }

    public override void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        var title = "HAPPY NGETIK SAYY";
        var titleSize = GameRoot.Font.MeasureString(title);
        spriteBatch.DrawString(GameRoot.Font, title, new Vector2(GameRoot.ScreenWidth / 2 - titleSize.X / 2, 150), Color.Cyan);

        for (int i = 0; i < _menuItems.Length; i++)
        {
            Color color = (i == _selectedIndex) ? Color.Yellow : Color.White;
            string text = (i == _selectedIndex) ? "> " + _menuItems[i] + " <" : _menuItems[i];
            Vector2 size = GameRoot.Font.MeasureString(text);
            spriteBatch.DrawString(GameRoot.Font, text, new Vector2(GameRoot.ScreenWidth / 2 - size.X / 2, 300 + i * 50), color);
        }
        
        var instruct = "Use W/S or UP/DOWN to move. ENTER to select.";
        var instSize = GameRoot.Font.MeasureString(instruct);
        spriteBatch.DrawString(GameRoot.Font, instruct, new Vector2(GameRoot.ScreenWidth / 2 - instSize.X / 2, GameRoot.ScreenHeight - 50), Color.Gray);
    }
}
