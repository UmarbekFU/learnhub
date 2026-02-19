import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to LearnHub - Start your learning journey</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "580px" }}>
          <Heading style={{ fontSize: "24px", color: "#333" }}>
            Welcome to LearnHub!
          </Heading>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Hi {name || "there"},
          </Text>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Thank you for joining LearnHub! We&apos;re excited to have you on board. Start exploring
            our catalog of courses and begin your learning journey today.
          </Text>
          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Text style={{ fontSize: "14px", color: "#999" }}>
              Happy learning!
              <br />
              The LearnHub Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
