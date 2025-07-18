/**
 * Automatically generated by expo-modules-autolinking.
 *
 * This autogenerated class provides a list of classes of native Expo modules,
 * but only these that are written in Swift and use the new API for creating Expo modules.
 */

import ExpoModulesCore
import EXApplication
import EXAV
import ExpoBlur
import ExpoCamera
import ExpoFileSystem
import ExpoImagePicker
import ExpoKeepAwake
import ExpoLinearGradient
import ExpoTrackingTransparency
#if EXPO_CONFIGURATION_DEBUG
import EXDevLauncher
import EXDevMenu
#endif

@objc(ExpoModulesProvider)
public class ExpoModulesProvider: ModulesProvider {
  public override func getModuleClasses() -> [AnyModule.Type] {
    #if EXPO_CONFIGURATION_DEBUG
    return [
      ApplicationModule.self,
      VideoViewModule.self,
      BlurViewModule.self,
      CameraViewModule.self,
      CameraViewNextModule.self,
      FileSystemModule.self,
      ImagePickerModule.self,
      KeepAwakeModule.self,
      LinearGradientModule.self,
      TrackingTransparencyModule.self,
      DevLauncherInternal.self,
      DevLauncherAuth.self,
      RNCSafeAreaProviderManager.self,
      DevMenuModule.self,
      DevMenuInternalModule.self,
      DevMenuPreferences.self,
      RNCSafeAreaProviderManager.self
    ]
    #else
    return [
      ApplicationModule.self,
      VideoViewModule.self,
      BlurViewModule.self,
      CameraViewModule.self,
      CameraViewNextModule.self,
      FileSystemModule.self,
      ImagePickerModule.self,
      KeepAwakeModule.self,
      LinearGradientModule.self,
      TrackingTransparencyModule.self
    ]
    #endif
  }

  public override func getAppDelegateSubscribers() -> [ExpoAppDelegateSubscriber.Type] {
    #if EXPO_CONFIGURATION_DEBUG
    return [
      FileSystemBackgroundSessionHandler.self,
      ExpoDevLauncherAppDelegateSubscriber.self
    ]
    #else
    return [
      FileSystemBackgroundSessionHandler.self
    ]
    #endif
  }

  public override func getReactDelegateHandlers() -> [ExpoReactDelegateHandlerTupleType] {
    #if EXPO_CONFIGURATION_DEBUG
    return [
      (packageName: "expo-dev-launcher", handler: ExpoDevLauncherReactDelegateHandler.self),
      (packageName: "expo-dev-menu", handler: ExpoDevMenuReactDelegateHandler.self)
    ]
    #else
    return [
    ]
    #endif
  }
}
