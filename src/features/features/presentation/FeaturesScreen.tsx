import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AIError } from 'syzygy-ai-rn';
import type { LLMProvider, LLMRequest } from 'syzygy-ai-rn';
import type {
  ConfigKey,
  ConfigRegistry,
  FeatureFlag,
  InMemoryFeatureFlagProvider,
} from 'syzygy-core-rn';
import { SyzygyID, createStorageKey } from 'syzygy-foundation-rn';
import type { InMemoryStorageProvider } from 'syzygy-services-rn';
import {
  CardView,
  PrimaryButton,
  ProgressBar,
  defaultTypography,
  getColors,
  spacing,
} from 'syzygy-ui-rn';

import { AppContainer, DI_KEYS } from '../../../di/AppModule';
import { OfflineLLMProvider } from '../data/OfflineLLMProvider';

const c = getColors('light');

interface DemoItem {
  name: string;
}

export interface FeaturesScreenProps {
  onBack?: () => void;
}

/** A small demonstration of each Syzygy layer, using only public APIs and no keys. */
export function FeaturesScreen({
  onBack,
}: FeaturesScreenProps): React.JSX.Element {
  const [foundation, setFoundation] = useState('');
  const [core, setCore] = useState('');
  const [services, setServices] = useState('');
  const [ai, setAi] = useState('');
  const [progress, setProgress] = useState(0);

  const runDemos = useCallback(async () => {
    setProgress(0);

    // Foundation: a typed identifier.
    const id = new SyzygyID<DemoItem>('example-item-1');
    setFoundation(`${id.toString()} (equals itself: ${id.equals(id)})`);
    setProgress(0.2);

    // Core: a config value and a feature flag, each with a default.
    try {
      const registry = AppContainer.resolve<ConfigRegistry>(
        DI_KEYS.configRegistry,
      );
      const flags = AppContainer.resolve<InMemoryFeatureFlagProvider>(
        DI_KEYS.featureFlagProvider,
      );
      const greetingKey: ConfigKey<string> = {
        name: 'example.greeting',
        defaultValue: 'Hello from Core',
      };
      const showAiFlag: FeatureFlag<boolean> = {
        key: 'example.showAIDemo',
        defaultValue: true,
        description: 'Shows the AI demo',
      };
      const enabled = flags.value(showAiFlag);
      setCore(`${registry.get(greetingKey)} | flag: ${enabled ? 'on' : 'off'}`);
    } catch (error) {
      setCore(`Core registry unavailable: ${(error as Error).message}`);
    }
    setProgress(0.4);

    // Services: storage write and read, handling the storage error type.
    try {
      const storage = AppContainer.resolve<InMemoryStorageProvider>(
        DI_KEYS.storageProvider,
      );
      const key = createStorageKey<string>('example.lastRun', '');
      await storage.set(`run ${Date.now()}`, key);
      const stored = await storage.get(key);
      setServices(`Stored: ${stored ?? 'nothing'}`);
    } catch (error) {
      setServices(
        error instanceof TypeError
          ? `Storage error: ${error.message}`
          : `Storage unavailable: ${(error as Error).message}`,
      );
    }
    setProgress(0.6);

    // AI: one call through the LLMProvider contract with the offline provider.
    const provider: LLMProvider = new OfflineLLMProvider();
    const request: LLMRequest = {
      messages: [{ role: 'user', content: 'Hello Syzygy' }],
      model: 'offline-demo',
    };
    try {
      const response = await provider.complete(request);
      setAi(`${response.content} (${response.providerName ?? 'unknown'})`);
    } catch (error) {
      setAi(
        error instanceof AIError
          ? `AI error (${error.code}): ${error.message}`
          : `AI unavailable: ${(error as Error).message}`,
      );
    }
    setProgress(1);
  }, []);

  useEffect(() => {
    // Run once on mount. The run is deferred by one microtask so the state
    // updates inside runDemos are not made synchronously in the effect body.
    void Promise.resolve().then(runDemos);
  }, [runDemos]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Features</Text>
        <LayerCard
          title="Foundation"
          detail="SyzygyID<T> from syzygy-foundation-rn"
          result={foundation}
        />
        <LayerCard
          title="Core"
          detail="ConfigRegistry.get and FeatureFlag, each with a default"
          result={core}
        />
        <LayerCard
          title="Services"
          detail="InMemoryStorageProvider.set and get, TypeError on bad data"
          result={services}
        />
        <LayerCard
          title="AI"
          detail="LLMProvider.complete with the offline provider"
          result={ai}
        />
        <CardView>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>UI</Text>
            <Text style={styles.cardDetail}>
              PrimaryButton, CardView and ProgressBar from syzygy-ui-rn
            </Text>
            <ProgressBar progress={progress} />
            <PrimaryButton
              title="Run the layer demos"
              onPress={() => void runDemos()}
            />
          </View>
        </CardView>
        {onBack ? <PrimaryButton title="Back" onPress={onBack} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

interface LayerCardProps {
  title: string;
  detail: string;
  result: string;
}

function LayerCard({
  title,
  detail,
  result,
}: LayerCardProps): React.JSX.Element {
  return (
    <CardView>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDetail}>{detail}</Text>
        <Text style={styles.cardResult}>
          {result.length === 0 ? 'Not run yet' : result}
        </Text>
      </View>
    </CardView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...defaultTypography.display,
    color: c.textPrimary,
  },
  card: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    ...defaultTypography.body,
    color: c.textPrimary,
    fontWeight: '600',
  },
  cardDetail: {
    ...defaultTypography.body,
    color: c.textSecondary,
  },
  cardResult: {
    ...defaultTypography.body,
    color: c.textPrimary,
  },
});
