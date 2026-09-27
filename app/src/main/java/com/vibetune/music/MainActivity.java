package com.vibetune.music;

import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.vibetune.music.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;
    private boolean playing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.startButton.setOnClickListener(v -> togglePlayer());
        binding.playButton.setOnClickListener(v -> togglePlayer());

        binding.bottomNav.setOnItemSelectedListener(item -> {
            if (item.getItemId() == R.id.nav_home) return true;
            if (item.getItemId() == R.id.nav_search) {
                Toast.makeText(this, "Search will be added in Phase 4", Toast.LENGTH_SHORT).show();
                return true;
            }
            if (item.getItemId() == R.id.nav_library) {
                Toast.makeText(this, "Library will be added in Phase 7", Toast.LENGTH_SHORT).show();
                return true;
            }
            return false;
        });
    }

    private void togglePlayer() {
        playing = !playing;
        binding.playButton.setImageResource(playing ? R.drawable.ic_pause : R.drawable.ic_play);
        binding.startButton.setText(playing ? "Playing" : "Start listening");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        binding = null;
    }
}
