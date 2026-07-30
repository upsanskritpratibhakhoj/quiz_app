const fs = require('fs');
const path = require('path');

const gradlePath = path.join(__dirname, '../android/app/build.gradle');

if (!fs.existsSync(gradlePath)) {
  console.error(`Error: android/app/build.gradle not found at ${gradlePath}`);
  process.exit(1);
}

let content = fs.readFileSync(gradlePath, 'utf8');
let modified = false;

// 1. Enable Minification
// Find the variable definition for enableMinifyInReleaseBuilds and set it to true
if (content.includes('def enableMinifyInReleaseBuilds =')) {
  content = content.replace(/def enableMinifyInReleaseBuilds = .*/g, 'def enableMinifyInReleaseBuilds = true');
  console.log('- Set enableMinifyInReleaseBuilds to true');
  modified = true;
}

// 2. Enable Resource Shrinking
// Find the variable definition for enableShrinkResources and set it to 'true'
if (content.includes('def enableShrinkResources =')) {
  content = content.replace(/def enableShrinkResources = .*/g, "def enableShrinkResources = 'true'");
  console.log("- Set enableShrinkResources to 'true'");
  modified = true;
}

// 3. Configure ABI Filters (limit to armeabi-v7a, arm64-v8a)
// Check if abiFilters is already configured, if not inject it into defaultConfig
if (content.includes('abiFilters')) {
  console.log('- ABI Filters already configured in build.gradle.');
} else {
  const target = /defaultConfig\s*\{/;
  if (target.test(content)) {
    content = content.replace(
      target,
      'defaultConfig {\n        ndk {\n            abiFilters "armeabi-v7a", "arm64-v8a"\n        }'
    );
    console.log('- Injected ndk abiFilters configuration into defaultConfig');
    modified = true;
  } else {
    console.error('Error: Could not find defaultConfig block in build.gradle');
    process.exit(1);
  }
}

if (modified) {
  fs.writeFileSync(gradlePath, content, 'utf8');
  console.log('Successfully updated android/app/build.gradle with optimized release settings.');
} else {
  console.log('No modifications were made to android/app/build.gradle.');
}
