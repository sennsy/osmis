using System;

namespace HappyNgetikSayy;

public static class WordManager
{
    private static Random _random = new Random();
    private static string[] _words = new string[]
    {
        "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon",
        "mango", "nectarine", "orange", "papaya", "quince", "raspberry", "strawberry", "tangerine", "ugli", "watermelon",
        "house", "mouse", "blouse", "spouse", "douse", "grouse", "louse", "rouse", "souse", "arouse",
        "water", "earth", "fire", "wind", "heart", "planet", "galaxy", "universe", "star", "moon",
        "sun", "cloud", "rain", "snow", "storm", "thunder", "lightning", "breeze", "tornado", "hurricane",
        "computer", "keyboard", "mousepad", "monitor", "speaker", "printer", "scanner", "router", "modem", "cable",
        "software", "hardware", "network", "internet", "website", "browser", "database", "server", "client", "protocol",
        "algorithm", "variable", "function", "object", "class", "method", "property", "event", "delegate", "interface",
        "abstract", "virtual", "override", "sealed", "static", "public", "private", "protected", "internal", "readonly",
        "string", "integer", "boolean", "double", "float", "decimal", "character", "array", "list", "dictionary",
        "dog", "cat", "bird", "fish", "turtle", "rabbit", "hamster", "guineapig", "parrot", "goldfish",
        "lion", "tiger", "bear", "elephant", "giraffe", "zebra", "monkey", "gorilla", "kangaroo", "koala",
        "school", "college", "university", "student", "teacher", "professor", "classroom", "library", "laboratory", "gymnasium"
    };

    public static string GetRandomWord()
    {
        return _words[_random.Next(_words.Length)];
    }
}
