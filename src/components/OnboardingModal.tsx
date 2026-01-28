/**
 * OnboardingModal.tsx
 * Welcome tour for first-time users - gentle, optional, 4-step introduction
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../constants/theme';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Just Today',
    content: 'A calm space for getting through today, one moment at a time.',
    details: [
      'Some days feel overwhelming',
      'You need flexibility with energy',
      'You want encouragement, not pressure',
    ],
    detailsTitle: 'This is for you if:',
  },
  {
    id: 'energy',
    title: 'What Pace Feels Right Today?',
    content: 'Your pace can change throughout the day. JustToday adapts with you.',
    energyModes: [
      { name: 'Gentle', description: 'For days when you need gentleness' },
      { name: 'Steady', description: 'Your usual pace' },
      { name: 'Deep', description: 'When you have extra capacity' },
    ],
  },
  {
    id: 'first-task',
    title: 'What\'s One Thing for Today?',
    content: 'You can always add more. Start with just one thing.',
    examples: [
      'Take a shower',
      'Send one email',
      'Eat something',
    ],
    examplesTitle: 'It could be:',
  },
  {
    id: 'tools',
    title: 'Two More Tools for You',
    tools: [
      {
        name: 'Extras',
        description: 'Optional things that tend to feel good at each pace: drink water, take deep breath',
      },
      {
        name: 'Transitions',
        description: 'Step-by-step checklists for when you need structure: morning routine, wind down',
      },
    ],
  },
];

export function OnboardingModal({ visible, onComplete, onDismiss }: OnboardingModalProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Step indicators */}
            <View style={styles.stepIndicators}>
              {STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        index === currentStep
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {step.title}
            </Text>

            {/* Step counter */}
            <Text style={[styles.stepCounter, { color: theme.colors.textSecondary }]}>
              {currentStep + 1} of {STEPS.length}
            </Text>

            {/* Content */}
            <Text style={[styles.content, { color: theme.colors.text }]}>
              {step.content}
            </Text>

            {/* Step 1: Welcome details */}
            {step.id === 'welcome' && step.details && (
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailsTitle, { color: theme.colors.text }]}>
                  {step.detailsTitle}
                </Text>
                {step.details.map((detail, index) => (
                  <Text key={index} style={[styles.detailItem, { color: theme.colors.text }]}>
                    • {detail}
                  </Text>
                ))}
              </View>
            )}

            {/* Step 2: Energy modes */}
            {step.id === 'energy' && step.energyModes && (
              <View style={styles.energyModesContainer}>
                {step.energyModes.map((mode, index) => (
                  <View
                    key={index}
                    style={[
                      styles.energyModeCard,
                      {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.energyModeName, { color: theme.colors.text }]}>
                      {mode.name}
                    </Text>
                    <Text style={[styles.energyModeDesc, { color: theme.colors.textSecondary }]}>
                      {mode.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Step 3: Examples */}
            {step.id === 'first-task' && step.examples && (
              <View style={styles.detailsContainer}>
                <Text style={[styles.detailsTitle, { color: theme.colors.text }]}>
                  {step.examplesTitle}
                </Text>
                {step.examples.map((example, index) => (
                  <Text key={index} style={[styles.detailItem, { color: theme.colors.text }]}>
                    • "{example}"
                  </Text>
                ))}
              </View>
            )}

            {/* Step 4: Tools */}
            {step.id === 'tools' && step.tools && (
              <View style={styles.toolsContainer}>
                {step.tools.map((tool, index) => (
                  <View key={index} style={styles.toolCard}>
                    <Text style={[styles.toolName, { color: theme.colors.text }]}>
                      {tool.name}
                    </Text>
                    <Text style={[styles.toolDesc, { color: theme.colors.textSecondary }]}>
                      {tool.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Navigation buttons */}
          <View style={[styles.buttonContainer, { borderTopColor: theme.colors.border }]}>
            <View style={styles.buttonRow}>
              {currentStep > 0 ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
                    ← Back
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleSkip}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
                    Skip Tour
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Start Using App' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(480, width * 0.9);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepCounter: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsContainer: {
    gap: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailItem: {
    fontSize: 16,
    lineHeight: 24,
    paddingLeft: 8,
  },
  energyModesContainer: {
    gap: 12,
  },
  energyModeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  energyModeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  energyModeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  toolsContainer: {
    gap: 16,
  },
  toolCard: {
    gap: 8,
  },
  toolName: {
    fontSize: 18,
    fontWeight: '600',
  },
  toolDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    borderTopWidth: 1,
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
