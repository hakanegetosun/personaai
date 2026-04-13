import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { InfluencerCategory } from "@/types/category";
import CategoryOnboardingForm from "@/components/onboarding/CategoryOnboardingForm";
import BasicInfoForm from "@/components/onboarding/BasicInfoForm";
import OnboardingPreview from "@/components/onboarding/OnboardingPreview";
import styles from "./onboarding.module.css";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("category, display_name, age, onboarding_step, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const initialCategory = (profile?.category as InfluencerCategory) ?? null;
  const onboardingStep = profile?.onboarding_step ?? 1;
  const onboardingCompleted = profile?.onboarding_completed ?? false;

  if (initialCategory && onboardingCompleted) {
    redirect("/studio");
  }

  let headline = "Your creator";
  let headlineAccent = "identity starts here.";
  let supportCopy =
    "Choose the creative direction that fits your vision. Aviora builds a complete AI creator around your niche from content and persona to planning, hooks, and trend-aware outputs.";

  if (onboardingStep === 2) {
    headline = "A little";
    headlineAccent = "personal context.";
    supportCopy =
      "Add a few optional details so your creator setup feels more personal from the very first calendar.";
  }

  if (onboardingStep === 3) {
    headline = "Preview the";
    headlineAccent = "direction before launch.";
    supportCopy =
      "Review the type of content Aviora will begin building for your creator flow before generating the first 30-day calendar.";
  }

  return (
    <main className={styles.root}>
      <div className={styles.left}>
        <div className={styles.leftGrid} />

        <div className={styles.leftInner}>
          <div className={styles.stepBadge}>
            <div className={styles.stepDot} />
            <span className={styles.stepText}>Step {onboardingStep} of 3</span>
          </div>

          <p className={styles.brandLabel}>Aviora</p>

          <h1 className={styles.headline}>
            {headline}
            <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h1>

          <div className={styles.divider} />

          <p className={styles.supportCopy}>{supportCopy}</p>

          <div className={styles.valuePoints}>
            <div className={styles.valueItem}>
              <div className={`${styles.valueIcon} ${styles.valueIconA}`}>✦</div>
              Category-aware content logic from day one
            </div>

            <div className={styles.valueItem}>
              <div className={`${styles.valueIcon} ${styles.valueIconB}`}>📅</div>
              30-day calendar structure designed around your niche
            </div>

            <div className={styles.valueItem}>
              <div className={`${styles.valueIcon} ${styles.valueIconC}`}>↺</div>
              Fresh creator-ready planning each cycle
            </div>
          </div>

          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
              <span>Onboarding progress</span>
              <span>{onboardingStep} / 3</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width:
                    onboardingStep === 1
                      ? "33%"
                      : onboardingStep === 2
                      ? "66%"
                      : "100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        {onboardingStep === 1 ? (
          <CategoryOnboardingForm initialCategory={initialCategory} />
        ) : null}

        {onboardingStep === 2 ? (
          <BasicInfoForm
            initialName={profile?.display_name ?? null}
            initialAge={profile?.age ?? null}
          />
        ) : null}

        {onboardingStep === 3 && initialCategory ? (
          <OnboardingPreview category={initialCategory} />
        ) : null}
      </div>
    </main>
  );
}
