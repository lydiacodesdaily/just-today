'use client';

import { useSettingsStore } from '@/src/stores/settingsStore';
import { TickingSoundType, ThemePreference } from '@/src/models/Settings';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { setTheme } = useTheme();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleThemeChange = (theme: ThemePreference) => {
    updateSettings({ themePreference: theme });
    setTheme(theme);
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-calm-text mb-2">Settings</h1>
          <p className="text-calm-muted">Customize your experience</p>
        </header>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-calm-surface border border-calm-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-calm-text mb-4">Appearance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-calm-text mb-2">
                  Theme
                </label>
                <div className="flex gap-3">
                  {(['light', 'dark', 'system'] as ThemePreference[]).map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => handleThemeChange(themeOption)}
                      className={`flex-1 px-4 py-2.5 rounded-lg border font-medium text-sm capitalize transition-colors ${
                        settings.themePreference === themeOption
                          ? 'bg-calm-primary text-white border-calm-primary'
                          : 'bg-calm-bg text-calm-text border-calm-border hover:border-calm-text/30'
                      }`}
                    >
                      {themeOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Voice & Sounds */}
          <section className="bg-calm-surface border border-calm-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-calm-text mb-4">Voice & Sounds</h2>

            <div className="space-y-6">
              {/* Primary toggles */}
              <div className="space-y-4">
                {/* Voice Announcements */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-calm-text">Voice Announcements</div>
                    <div className="text-sm text-calm-muted">Task transitions and updates</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.ttsEnabled}
                      onChange={() => toggleSetting('ttsEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-calm-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-calm-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-calm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-calm-primary"></div>
                  </label>
                </div>

                {/* Ticking Sound */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-calm-text">Ticking Sound</div>
                    <div className="text-sm text-calm-muted">Background timer sound</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tickingEnabled}
                      onChange={() => toggleSetting('tickingEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-calm-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-calm-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-calm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-calm-primary"></div>
                  </label>
                </div>
              </div>

              {/* Secondary toggles */}
              <div className="pl-4 space-y-4 border-l-2 border-calm-border">
                {/* Minute Announcements */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-calm-text">Minute Countdowns</div>
                    <div className="text-xs text-calm-muted">Announce each minute remaining</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.minuteAnnouncementsEnabled}
                      onChange={() => toggleSetting('minuteAnnouncementsEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-calm-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-calm-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-calm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-calm-primary"></div>
                  </label>
                </div>

                {/* Overtime Reminders */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-calm-text">Overtime Reminders</div>
                    <div className="text-xs text-calm-muted">Gentle reminders when over time</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.overtimeRemindersEnabled}
                      onChange={() => toggleSetting('overtimeRemindersEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-calm-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-calm-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-calm-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-calm-primary"></div>
                  </label>
                </div>
              </div>

              {/* Ticking Sound Type (only show when ticking is enabled) */}
              {settings.tickingEnabled && (
                <div className="pt-4 border-t border-calm-border">
                  <label className="block text-sm font-medium text-calm-text mb-3">
                    Ticking Sound Style
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'tick2-tok2' as TickingSoundType, label: 'Gentle (Default)' },
                      { value: 'tick1-tok1' as TickingSoundType, label: 'Classic' },
                      { value: 'beep' as TickingSoundType, label: 'Beep' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="tickingSound"
                          checked={settings.tickingSoundType === option.value}
                          onChange={() => updateSettings({ tickingSoundType: option.value })}
                          className="w-4 h-4 text-calm-primary border-calm-border focus:ring-2 focus:ring-calm-primary"
                        />
                        <span className="text-sm text-calm-text group-hover:text-calm-primary transition-colors">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Volume Controls */}
              <div className="pt-4 border-t border-calm-border space-y-4">
                <h3 className="text-sm font-semibold text-calm-text">Volume</h3>

                {/* Voice Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-calm-text">Voice</label>
                    <span className="text-xs text-calm-muted">{Math.round(settings.ttsVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.ttsVolume * 100}
                    onChange={(e) => updateSettings({ ttsVolume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-calm-border rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Chimes & Alerts Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-calm-text">Chimes & Alerts</label>
                    <span className="text-xs text-calm-muted">{Math.round(settings.announcementVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.announcementVolume * 100}
                    onChange={(e) => updateSettings({ announcementVolume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-calm-border rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Ticking Volume */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-calm-text">Ticking</label>
                    <span className="text-xs text-calm-muted">{Math.round(settings.tickingVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.tickingVolume * 100}
                    onChange={(e) => updateSettings({ tickingVolume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 bg-calm-border rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Info note */}
          <div className="text-center text-sm text-calm-muted">
            Audio features work best in supported browsers. Some features may require user interaction to enable.
          </div>
        </div>

        {/* Footer spacing for mobile bottom nav - ensures tooltips and content aren't hidden */}
        <div className="h-24 md:h-0"></div>
      </div>
    </div>
  );
}
