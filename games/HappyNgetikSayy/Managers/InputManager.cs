using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;

namespace HappyNgetikSayy;

public static class InputManager
{
    private static KeyboardState _currentKeyState;
    private static KeyboardState _previousKeyState;

    public static void Update()
    {
        _previousKeyState = _currentKeyState;
        _currentKeyState = Keyboard.GetState();
    }

    public static bool IsKeyPressed(Keys key)
    {
        return _currentKeyState.IsKeyDown(key) && !_previousKeyState.IsKeyDown(key);
    }

    public static Keys[] GetPressedKeys()
    {
        var currentKeys = _currentKeyState.GetPressedKeys();
        var newlyPressed = new List<Keys>();
        foreach (var key in currentKeys)
        {
            if (!_previousKeyState.IsKeyDown(key))
            {
                newlyPressed.Add(key);
            }
        }
        return newlyPressed.ToArray();
    }
}
