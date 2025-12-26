/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/settings` | `/_sitemap` | `/routine/run` | `/settings`;
      DynamicRoutes: `/routine/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/routine/[id]`;
    }
  }
}
