using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System.Collections.Generic;

namespace WongTersakitiBross
{
    public static class MiniFont
    {
        // 3x5 font for numbers and uppercase letters
        private static readonly Dictionary<char, int[]> _chars = new Dictionary<char, int[]>
        {
            {'0', new[] {1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1}},
            {'1', new[] {0,1,0, 1,1,0, 0,1,0, 0,1,0, 1,1,1}},
            {'2', new[] {1,1,1, 0,0,1, 1,1,1, 1,0,0, 1,1,1}},
            {'3', new[] {1,1,1, 0,0,1, 1,1,1, 0,0,1, 1,1,1}},
            {'4', new[] {1,0,1, 1,0,1, 1,1,1, 0,0,1, 0,0,1}},
            {'5', new[] {1,1,1, 1,0,0, 1,1,1, 0,0,1, 1,1,1}},
            {'6', new[] {1,1,1, 1,0,0, 1,1,1, 1,0,1, 1,1,1}},
            {'7', new[] {1,1,1, 0,0,1, 0,1,0, 0,1,0, 0,1,0}},
            {'8', new[] {1,1,1, 1,0,1, 1,1,1, 1,0,1, 1,1,1}},
            {'9', new[] {1,1,1, 1,0,1, 1,1,1, 0,0,1, 1,1,1}},
            {'A', new[] {1,1,1, 1,0,1, 1,1,1, 1,0,1, 1,0,1}},
            {'C', new[] {1,1,1, 1,0,0, 1,0,0, 1,0,0, 1,1,1}},
            {'D', new[] {1,1,0, 1,0,1, 1,0,1, 1,0,1, 1,1,0}},
            {'E', new[] {1,1,1, 1,0,0, 1,1,1, 1,0,0, 1,1,1}},
            {'G', new[] {1,1,1, 1,0,0, 1,0,1, 1,0,1, 1,1,1}},
            {'I', new[] {1,1,1, 0,1,0, 0,1,0, 0,1,0, 1,1,1}},
            {'L', new[] {1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,1,1}},
            {'M', new[] {1,0,1, 1,1,1, 1,0,1, 1,0,1, 1,0,1}},
            {'N', new[] {1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,0,1}},
            {'O', new[] {1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1}},
            {'P', new[] {1,1,1, 1,0,1, 1,1,1, 1,0,0, 1,0,0}},
            {'R', new[] {1,1,1, 1,0,1, 1,1,0, 1,0,1, 1,0,1}},
            {'S', new[] {1,1,1, 1,0,0, 1,1,1, 0,0,1, 1,1,1}},
            {'T', new[] {1,1,1, 0,1,0, 0,1,0, 0,1,0, 0,1,0}},
            {'U', new[] {1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1}},
            {'V', new[] {1,0,1, 1,0,1, 1,0,1, 1,0,1, 0,1,0}},
            {' ', new[] {0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0}},
            {'-', new[] {0,0,0, 0,0,0, 1,1,1, 0,0,0, 0,0,0}},
            {':', new[] {0,0,0, 0,1,0, 0,0,0, 0,1,0, 0,0,0}},
        };

        public static void DrawText(SpriteBatch sb, string text, Vector2 position, Color color, int scale = 2)
        {
            text = text.ToUpper();
            int offsetX = 0;
            int width = 3;
            int height = 5;

            foreach (char c in text)
            {
                if (_chars.ContainsKey(c))
                {
                    int[] pixels = _chars[c];
                    for (int y = 0; y < height; y++)
                    {
                        for (int x = 0; x < width; x++)
                        {
                            if (pixels[y * width + x] == 1)
                            {
                                sb.Draw(Globals.Pixel, new Rectangle((int)position.X + (offsetX + x) * scale, (int)position.Y + y * scale, scale, scale), color);
                            }
                        }
                    }
                }
                offsetX += width + 1; // 1 pixel spacing
            }
        }
    }
}
