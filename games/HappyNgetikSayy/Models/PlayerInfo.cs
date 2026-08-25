namespace HappyNgetikSayy;

public class PlayerInfo
{
    public int HP { get; set; } = 5;
    public int Score { get; set; } = 0;
    public int Combo { get; set; } = 0;
    public int MaxCombo { get; set; } = 0;
    
    public int CorrectKeystrokes { get; set; } = 0;
    public int TotalKeystrokes { get; set; } = 0;
    public int WordsTyped { get; set; } = 0;
    public double TotalSecondsPlayed { get; set; } = 0;

    public int Multiplier
    {
        get
        {
            if (Combo >= 20) return 3;
            if (Combo >= 10) return 2;
            return 1;
        }
    }

    public int WPM
    {
        get
        {
            if (TotalSecondsPlayed == 0) return 0;
            // Standard WPM = (characters / 5) / minutes
            return (int)((CorrectKeystrokes / 5.0) / (TotalSecondsPlayed / 60.0));
        }
    }

    public float Accuracy
    {
        get
        {
            if (TotalKeystrokes == 0) return 100f;
            return ((float)CorrectKeystrokes / TotalKeystrokes) * 100f;
        }
    }
}
