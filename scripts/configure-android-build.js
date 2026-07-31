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

// 4. Configure Custom Proguard Rules for R8
const proguardPath = path.join(__dirname, '../android/app/proguard-rules.pro');
if (fs.existsSync(proguardPath)) {
  let proguardContent = fs.readFileSync(proguardPath, 'utf8');
  const customRulesMarker = '# Custom Expo module R8 / Proguard rules';
  const customRules = `
${customRulesMarker} to fix missing class errors
-keep class expo.modules.** { *; }
-keep class expo.modules.kotlin.** { *; }
-keepclassmembers class * {
    @expo.modules.core.interfaces.ExpoProp *;
}
-dontwarn expo.modules.**
-dontwarn expo.modules.kotlin.**

# Keep Kotlin Metadata (needed for kotlin-reflect to work in Expo Kotlin interop)
-keep class kotlin.Metadata { *; }

# Keep Kotlin reflection classes
-keep class kotlin.reflect.** { *; }
-dontwarn kotlin.reflect.**
`;

  // Remove existing custom rules block if present, then append the new rules
  const markerIndex = proguardContent.indexOf(customRulesMarker);
  if (markerIndex !== -1) {
    proguardContent = proguardContent.substring(0, markerIndex);
  }

  fs.writeFileSync(proguardPath, proguardContent.trim() + '\n' + customRules, 'utf8');
  console.log('Successfully updated custom Proguard rules in proguard-rules.pro');
} else {
  console.error(`Warning: android/app/proguard-rules.pro not found at ${proguardPath}`);
}

