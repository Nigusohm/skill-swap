import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";

type LandingScreenProps = {
  onOpenAuth: (mode: "login" | "register") => void;
};

type SectionKey = "hero" | "features" | "how" | "testimonials" | "footer";

const navItems: Array<{ key: SectionKey | "login" | "join"; label: string }> = [
  { key: "hero", label: "Home" },
  { key: "features", label: "Features" },
  { key: "how", label: "How it Works" },
  { key: "login", label: "Login" },
  { key: "join", label: "Join Now" }
];

const featureCards = [
  {
    icon: "shield-checkmark-outline",
    title: "Authentication",
    text: "Secure login/signup flow with polished onboarding and frictionless account access."
  },
  {
    icon: "person-circle-outline",
    title: "Skill Profiles",
    text: "Show what you have and what you want, with structured skill cards for better discovery."
  },
  {
    icon: "sparkles-outline",
    title: "Smart Match System",
    text: "Find relevant users quickly using overlap signals and compatibility score cards."
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "Realtime Chat",
    text: "Message instantly with modern conversation UI and smooth handoff from match to chat."
  },
  {
    icon: "notifications-outline",
    title: "Notifications",
    text: "Unified activity feed for new matches, messages, and upcoming sessions."
  },
  {
    icon: "grid-outline",
    title: "Dashboard Layout",
    text: "Analytics-style dashboard blocks for progress, goals, and action-ready insights."
  }
];

const steps = [
  {
    step: "1",
    title: "Create Your Profile",
    text: "Add your school, skills you can teach, and what you want to learn."
  },
  {
    step: "2",
    title: "Get Quality Matches",
    text: "SkillSwapPro recommends students that complement your goals."
  },
  {
    step: "3",
    title: "Chat, Plan, Grow",
    text: "Start chatting, schedule sessions, and track progress from one dashboard."
  }
];

const testimonials = [
  {
    quote: "The matching quality is amazing. I found two study partners in one day.",
    author: "Hana, CS Student"
  },
  {
    quote: "The UI feels premium and simple. It made collaboration much easier.",
    author: "Daniel, Engineering Student"
  }
];

export const LandingScreen: React.FC<LandingScreenProps> = ({ onOpenAuth }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const scrollRef = useRef<ScrollView | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sectionY, setSectionY] = useState<Record<SectionKey, number>>({
    hero: 0,
    features: 0,
    how: 0,
    testimonials: 0,
    footer: 0
  });

  const revealValues = useMemo(() => Array.from({ length: 6 }, () => new Animated.Value(0)), []);

  useEffect(() => {
    const animations = revealValues.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 450,
        delay: index * 110,
        useNativeDriver: true
      })
    );

    Animated.stagger(80, animations).start();
  }, [revealValues]);

  const onSectionLayout = (key: SectionKey) => (event: LayoutChangeEvent) => {
    const layoutY = event?.nativeEvent?.layout?.y;

    // Guard against cases where RN may deliver a layout without `layout.y`.
    if (typeof layoutY !== "number") {
      return;
    }

    setSectionY((previous) => ({ ...previous, [key]: layoutY }));
  };

  const scrollToSection = (key: SectionKey) => {
    const y = Math.max(0, (sectionY[key] ?? 0) - 76);

    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({ y, animated: true });
    setMenuOpen(false);
  };

  const onNavPress = (key: SectionKey | "login" | "join") => {
    if (key === "login") {
      onOpenAuth("login");
      return;
    }

    if (key === "join") {
      onOpenAuth("register");
      return;
    }

    scrollToSection(key);
  };

  const sectionAnimatedStyle = (index: number) => ({
    opacity: revealValues[index],
    transform: [
      {
        translateY: revealValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0]
        })
      }
    ]
  });

  const webGlass = Platform.OS === "web" ? ({ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" } as any) : undefined;

  const primaryButton = (label: string, onPress: () => void) => (
    <Pressable style={({ hovered, pressed }: any) => [styles.primaryShell, hovered && styles.primaryHover, pressed && styles.pressed]} onPress={onPress}>
      <LinearGradient
        colors={theme.colors.primaryGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryBtnText}>{label}</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </LinearGradient>
    </Pressable>
  );

  const secondaryButton = (label: string, onPress: () => void) => (
    <Pressable style={({ hovered, pressed }: any) => [styles.secondaryBtn, hovered && styles.secondaryHover, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.page}>
      <View style={[styles.navbar, scrolled && styles.navbarSolid, webGlass]}>
        <View style={styles.logoWrap}>
          <LinearGradient colors={theme.colors.primaryGradient as [string, string]} style={styles.logoBadge}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>SkillSwapPro</Text>
        </View>

        {isMobile ? (
          <Pressable style={styles.hamburger} onPress={() => setMenuOpen((current) => !current)}>
            <Ionicons name={menuOpen ? "close" : "menu"} size={22} color={theme.colors.text} />
          </Pressable>
        ) : (
          <View style={styles.navLinks}>
            {navItems.map((item) => {
              const isJoin = item.key === "join";

              if (isJoin) {
                return (
                  <View key={item.key} style={styles.navJoinWrap}>
                    {primaryButton("Join Now", () => onNavPress("join"))}
                  </View>
                );
              }

              return (
                <Pressable key={item.key} onPress={() => onNavPress(item.key)} style={({ hovered }: any) => [styles.navItem, hovered && styles.navItemHover]}>
                  {({ hovered }: any) => (
                    <>
                      <Text style={styles.navText}>{item.label}</Text>
                      <View style={[styles.navUnderline, hovered && styles.navUnderlineVisible]} />
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {isMobile && menuOpen ? (
        <View style={[styles.mobileMenu, webGlass]}>
          {navItems.map((item) => (
            <Pressable key={item.key} style={styles.mobileMenuItem} onPress={() => onNavPress(item.key)}>
              <Text style={styles.mobileMenuText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={(event) => setScrolled(event.nativeEvent.contentOffset.y > 14)}
      >
        <Animated.View style={[styles.hero, sectionAnimatedStyle(0)]} onLayout={onSectionLayout("hero")}>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroBadge}>Modern Skill Exchange Platform</Text>
            <Text style={styles.heroTitle}>Exchange Skills. Build Connections. </Text>
            <Text style={[styles.heroTitle, styles.heroTitleAccent]}>Grow Faster Together.</Text>
            <Text style={styles.heroSubtitle}>
              Premium SaaS-style experience for students with authentication, matching, real-time chat, notifications, and a modern dashboard.
            </Text>

            <View style={[styles.heroCtaRow, isMobile && styles.heroCtaColumn]}>
              {primaryButton("Get Started", () => onOpenAuth("register"))}
              {secondaryButton("How it Works", () => scrollToSection("how"))}
            </View>
          </View>

          <View style={styles.heroPanel}>
            <Text style={styles.heroPanelTitle}>Dashboard Preview</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>24</Text>
                <Text style={styles.metricLabel}>Active Matches</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricNumber}>8</Text>
                <Text style={styles.metricLabel}>Unread Chats</Text>
              </View>
            </View>
            <View style={styles.notifyCard}>
              <Ionicons name="notifications" size={16} color={theme.colors.accent} />
              <Text style={styles.notifyText}>New match found: UI/UX ↔ React Native</Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Learning Progress</Text>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={theme.colors.primaryGradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBarFill}
                />
              </View>
              <Text style={styles.progressMeta}>72% weekly goal complete</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnimatedStyle(1)} onLayout={onSectionLayout("features")}>
          <Text style={styles.sectionHeading}>Features</Text>
          <View style={[styles.grid, isMobile && styles.gridMobile]}>
            {featureCards.map((feature) => (
              <Pressable key={feature.title} style={({ hovered }: any) => [styles.featureCard, hovered && styles.cardHover]}>
                <LinearGradient colors={theme.colors.primaryGradient as [string, string]} style={styles.featureIconWrap}>
                  <Ionicons name={feature.icon as any} size={18} color="#fff" />
                </LinearGradient>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={sectionAnimatedStyle(2)} onLayout={onSectionLayout("how")}>
          <Text style={styles.sectionHeading}>How It Works</Text>
          <View style={[styles.grid3, isMobile && styles.gridMobile]}>
            {steps.map((step) => (
              <Pressable key={step.step} style={({ hovered }: any) => [styles.stepCard, hovered && styles.cardHover]}>
                <LinearGradient colors={theme.colors.primaryGradient as [string, string]} style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{step.step}</Text>
                </LinearGradient>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={sectionAnimatedStyle(3)} onLayout={onSectionLayout("testimonials")}>
          <Text style={styles.sectionHeading}>Testimonials</Text>
          <View style={[styles.grid2, isMobile && styles.gridMobile]}>
            {testimonials.map((item) => (
              <Pressable key={item.author} style={({ hovered }: any) => [styles.testimonialCard, hovered && styles.cardHover]}>
                <Text style={styles.quoteMark}>“</Text>
                <Text style={styles.quote}>{item.quote}</Text>
                <Text style={styles.author}>{item.author}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.footer, sectionAnimatedStyle(4)]} onLayout={onSectionLayout("footer")}>
          <Text style={styles.footerBrand}>SkillSwapPro</Text>
          <Text style={styles.footerText}>Premium student collaboration platform.</Text>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => scrollToSection("hero")}>
              <Text style={styles.footerLink}>Home</Text>
            </Pressable>
            <Pressable onPress={() => scrollToSection("features")}>
              <Text style={styles.footerLink}>Features</Text>
            </Pressable>
            <Pressable onPress={() => scrollToSection("how")}>
              <Text style={styles.footerLink}>How it Works</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: Platform.OS === "android" ? 18 : 12,
    paddingBottom: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(248,250,252,0.18)",
    borderBottomWidth: 1,
    borderBottomColor: "transparent"
  },
  navbarSolid: {
    backgroundColor: "rgba(248,250,252,0.95)",
    borderBottomColor: "#E2E8F0"
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  logoText: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  navItem: {
    alignItems: "center"
  },
  navItemHover: {
    opacity: 0.9
  },
  navText: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 14
  },
  navUnderline: {
    width: "100%",
    height: 2,
    backgroundColor: "#7C3AED",
    marginTop: 4,
    opacity: 0
  },
  navUnderlineVisible: {
    opacity: 1
  },
  navJoinWrap: {
    marginLeft: 4
  },
  hamburger: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  mobileMenu: {
    position: "absolute",
    top: 66,
    right: 14,
    zIndex: 25,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 175
  },
  mobileMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  mobileMenuText: {
    color: theme.colors.text,
    fontWeight: "700"
  },
  content: {
    paddingTop: 90,
    paddingBottom: 48,
    paddingHorizontal: 18,
    gap: 28
  },
  hero: {
    flexDirection: "row",
    gap: 18,
    flexWrap: "wrap"
  },
  heroTextWrap: {
    flex: 1,
    minWidth: 280
  },
  heroBadge: {
    alignSelf: "flex-start",
    color: "#6D28D9",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 12
  },
  heroTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 38,
    lineHeight: 44
  },
  heroTitleAccent: {
    color: "#7C3AED"
  },
  heroSubtitle: {
    color: theme.colors.muted,
    marginTop: 12,
    lineHeight: 24,
    fontSize: 16,
    maxWidth: 620
  },
  heroCtaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22
  },
  heroCtaColumn: {
    flexDirection: "column",
    alignItems: "stretch"
  },
  primaryShell: {
    borderRadius: 12
  },
  primaryHover: {
    transform: [{ scale: 1.03 }],
    shadowColor: "#9333EA",
    shadowOpacity: 0.26,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 150
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    borderWidth: 1,
    borderColor: "#C4B5FD",
    backgroundColor: "transparent"
  },
  secondaryHover: {
    backgroundColor: "#F3E8FF"
  },
  secondaryBtnText: {
    color: "#6D28D9",
    fontWeight: "800"
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  heroPanel: {
    flex: 1,
    minWidth: 280,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  heroPanelTitle: {
    color: theme.colors.text,
    fontWeight: "800",
    marginBottom: 10
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  metricNumber: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 20
  },
  metricLabel: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600"
  },
  notifyCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  notifyText: {
    color: "#065F46",
    fontWeight: "600",
    fontSize: 12,
    flex: 1
  },
  progressCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    padding: 10
  },
  progressTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 12
  },
  progressBarBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden"
  },
  progressBarFill: {
    width: "72%",
    height: "100%"
  },
  progressMeta: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "600"
  },
  sectionHeading: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 28,
    marginBottom: 12
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  grid2: {
    flexDirection: "row",
    gap: 12
  },
  grid3: {
    flexDirection: "row",
    gap: 12
  },
  gridMobile: {
    flexDirection: "column"
  },
  featureCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "31%",
    minWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    padding: 14
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  featureTitle: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 16
  },
  featureText: {
    color: theme.colors.muted,
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13
  },
  stepCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    minWidth: 220
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  stepBadgeText: {
    color: "#fff",
    fontWeight: "900"
  },
  stepTitle: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 16
  },
  stepText: {
    color: theme.colors.muted,
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    minWidth: 220
  },
  quoteMark: {
    color: "#9333EA",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "900"
  },
  quote: {
    color: theme.colors.text,
    marginTop: 6,
    fontWeight: "600",
    lineHeight: 22
  },
  author: {
    color: theme.colors.muted,
    marginTop: 10,
    fontWeight: "700"
  },
  cardHover: {
    transform: [{ translateY: -4 }],
    shadowColor: "#7C3AED",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3
  },
  footer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 18,
    paddingBottom: 20
  },
  footerBrand: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  footerText: {
    marginTop: 6,
    color: theme.colors.muted
  },
  footerLinks: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
    flexWrap: "wrap"
  },
  footerLink: {
    color: "#6D28D9",
    fontWeight: "700"
  }
});
