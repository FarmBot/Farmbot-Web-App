export interface FrontPageState {
  agreeToTerms: boolean;
  email?: string;
  forgotPasswordEmail?: string;
  loginPassword?: string;
  regConfirmation?: string;
  regEmail?: string;
  regName?: string;
  regPassword?: string;
  serverPort?: string;
  serverURL?: string;
  showServerOpts?: boolean;
  activePanel:
  | "resendVerificationEmail" /** Render the "resend verification" panel. */
  | "login"                   /** Render default login panel */
  | "forgotPassword"          /** Render forgotten password pane */;
}
