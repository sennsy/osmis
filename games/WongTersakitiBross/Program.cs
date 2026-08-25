using System;

namespace WongTersakitiBross
{
    public static class Program
    {
        [STAThread]
        static void Main()
        {
            using var game = new WongTersakitiBrossGame();
            game.Run();
        }
    }
}
