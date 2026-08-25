using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace HappyNgetikSayy;

public class TypingObject
{
    public string Word { get; private set; }
    public string TypedPart { get; private set; }
    public string RemainingPart { get; private set; }
    public Vector2 Position { get; set; }
    public float Speed { get; private set; }
    public bool IsDestroyed { get; private set; }

    public TypingObject(string word, Vector2 startPos, float speed)
    {
        Word = word.ToLower();
        TypedPart = "";
        RemainingPart = Word;
        Position = startPos;
        Speed = speed;
        IsDestroyed = false;
    }

    public void Update(GameTime gameTime)
    {
        Position = new Vector2(Position.X, Position.Y + Speed * (float)gameTime.ElapsedGameTime.TotalSeconds);
    }

    public bool TypeLetter(char c)
    {
        if (RemainingPart.Length > 0 && RemainingPart[0] == char.ToLower(c))
        {
            TypedPart += RemainingPart[0];
            RemainingPart = RemainingPart.Substring(1);
            if (RemainingPart.Length == 0)
            {
                IsDestroyed = true;
            }
            return true;
        }
        return false;
    }

    public void Draw(SpriteBatch spriteBatch, SpriteFont font)
    {
        if (IsDestroyed) return;

        // Draw background box
        Vector2 size = font.MeasureString(Word);
        Rectangle bgRect = new Rectangle((int)Position.X - 5, (int)Position.Y - 5, (int)size.X + 10, (int)size.Y + 10);
        spriteBatch.Draw(GameRoot.Pixel, bgRect, Color.Black * 0.7f);

        // Draw Typed Part
        spriteBatch.DrawString(font, TypedPart, Position, Color.Lime);
        
        // Draw Remaining Part
        Vector2 offset = new Vector2(font.MeasureString(TypedPart).X, 0);
        spriteBatch.DrawString(font, RemainingPart, Position + offset, Color.White);
    }
}
