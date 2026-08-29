using System;

namespace HappyNgetikSayy;

public static class WordManager
{
    private static Random _random = new Random();
    private static string[] _words = new string[]
    {
        // Beberapa kata original
        "osmis", "santri", "ngetik", "coding", "fokus", "target", "waktu", "sahabat",
        // Dominasi kata-kata alay / sadboy
        "merelakan", "terluka", "tulus", "tersakiti", "pahlawan", "pembunuh", "si paling effort", "disia-siakan", "diabaikan",
        "ultraman", "wong tulus", "setia", "badut", "kesatria", "pengorbanan", "ditinggalkan", "bertahan", "menyerah", "kecewa",
        "harapan", "palsu", "luka", "air mata", "sendiri", "kesepian", "hancur", "kenangan", "melupakan", "move on", "sakit",
        "ikhlas", "menunggu", "bayangan", "hilang", "pergi", "tanpa alasan", "cinta", "rahasia", "kisah", "akhir",
        "galau", "patah hati", "lupa", "menangis", "senyum palsu"
    };

    public static string GetRandomWord()
    {
        return _words[_random.Next(_words.Length)];
    }
}
