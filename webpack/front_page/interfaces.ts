export interface FrontPageState {
  regName?: string;
  regEmail?: string;
  regPassword?: string;
  regConfirmation?: string;
  email?: string;
  loginPassword?: string;
  showServerOpts?: boolean;
  serverURL?: string;
  serverPort?: string;
  forgotPasswordEmail?: string;
  agreeToTerms: boolean;
  activePanel:
  | "resendVerificationEmail" /** Render the "resend verification" panel. */
  | "login"                   /** Render default login panel */
  | "forgotPassword"          /** Render forgotten password pane */;
}
