export interface FrontPageState {
  registrationSent: boolean;
  agreeToTerms: boolean;
  email: string;
  forgotPasswordEmail: string;
  loginPassword: string;
  regConfirmation: string;
  regEmail: string;
  regName: string;
  regPassword: string;
  activePanel:
  | "resendVerificationEmail" /** Render the "resend verification" panel. */
  | "login"                   /** Render default login panel */
  | "forgotPassword"          /** Render forgotten password pane */;
}
