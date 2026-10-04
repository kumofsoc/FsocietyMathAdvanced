CREATE TABLE user_preferences (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme_name varchar(64) NOT NULL CHECK (
        theme_name IN (
            'Black',
            'White',
            'Catppuccin Mocha',
            'Catppuccin Latte',
            'Neovim',
            'Tokyo Night',
            'Gruvbox',
            'Nord',
            'Custom'
        )
    ),
    custom_theme jsonb NOT NULL CHECK (jsonb_typeof(custom_theme) = 'object'),
    cursor_mode varchar(32) NOT NULL CHECK (
        cursor_mode IN ('native', 'halo', 'minimal', 'crosshair', 'comet')
    ),
    motion_profile varchar(32) NOT NULL CHECK (
        motion_profile IN ('full', 'balanced', 'eco', 'off')
    ),
    sidebar_collapsed boolean NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
