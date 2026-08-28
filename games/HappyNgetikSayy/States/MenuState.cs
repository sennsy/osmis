using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public enum MenuScreenState { Main, CharacterSelection }

public class MenuState : BaseState
{
    private string[] _menuItems = { "Play", "Settings", "Exit" };
    private int _selectedIndex = 0;
    private MenuScreenState _state = MenuScreenState.Main;
    private int _selectedCharacterIndex = 0;

    public MenuState(GameStateManager stateManager, GraphicsDevice graphicsDevice) 
        : base(stateManager, graphicsDevice)
    {
    }

    public override void Update(GameTime gameTime)
    {
        if (_state == MenuScreenState.Main)
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
                    _state = MenuScreenState.CharacterSelection;
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
        else if (_state == MenuScreenState.CharacterSelection)
        {
            UpdateCharacterSelection();
        }
    }

    private void UpdateCharacterSelection()
    {
        if (InputManager.IsKeyPressed(Keys.Left) || InputManager.IsKeyPressed(Keys.A))
            _selectedCharacterIndex = (_selectedCharacterIndex - 1 + 3) % 3;
        if (InputManager.IsKeyPressed(Keys.Right) || InputManager.IsKeyPressed(Keys.D))
            _selectedCharacterIndex = (_selectedCharacterIndex + 1) % 3;

        if (InputManager.IsKeyPressed(Keys.Enter))
        {
            if (_selectedCharacterIndex == 0) GameRoot.SelectedPlayerTex = GameRoot.UltramanTex;
            else if (_selectedCharacterIndex == 1) GameRoot.SelectedPlayerTex = GameRoot.SpidermanTex;
            else if (_selectedCharacterIndex == 2) GameRoot.SelectedPlayerTex = GameRoot.BatmanTex;
            
            StateManager.ChangeState(new PlayState(StateManager, GraphicsDevice));
        }
        else if (InputManager.IsKeyPressed(Keys.Escape))
        {
            _state = MenuScreenState.Main;
        }
    }

    public override void Draw(GameTime gameTime, SpriteBatch spriteBatch)
    {
        if (_state == MenuScreenState.Main)
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
        else if (_state == MenuScreenState.CharacterSelection)
        {
            var title = "SELECT CHARACTER";
            var titleSize = GameRoot.Font.MeasureString(title);
            spriteBatch.DrawString(GameRoot.Font, title, new Vector2(GameRoot.ScreenWidth / 2 - titleSize.X / 2, 100), Color.White);

            string charName = _selectedCharacterIndex == 0 ? "WONG TULUS" : _selectedCharacterIndex == 1 ? "WONG MERELAKAN" : "WONG TERSAKITI";
            var nameSize = GameRoot.Font.MeasureString("< " + charName + " >");
            spriteBatch.DrawString(GameRoot.Font, "< " + charName + " >", new Vector2(GameRoot.ScreenWidth / 2 - nameSize.X / 2, 200), Color.Yellow);

            Texture2D tex = _selectedCharacterIndex == 0 ? GameRoot.UltramanTex : _selectedCharacterIndex == 1 ? GameRoot.SpidermanTex : GameRoot.BatmanTex;
            if (tex != null)
            {
                Rectangle dest = new Rectangle(GameRoot.ScreenWidth / 2 - 100, 300, 200, 300);
                spriteBatch.Draw(tex, dest, Color.White);
            }

            var instruct = "ENTER to Play. ESC to back.";
            var instSize = GameRoot.Font.MeasureString(instruct);
            spriteBatch.DrawString(GameRoot.Font, instruct, new Vector2(GameRoot.ScreenWidth / 2 - instSize.X / 2, 650), Color.White);
        }
    }
}
