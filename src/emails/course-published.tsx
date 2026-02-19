import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface CoursePublishedProps {
  instructorName: string;
  courseTitle: string;
}

export default function CoursePublished({ instructorName, courseTitle }: CoursePublishedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your course {courseTitle} has been published!</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "580px" }}>
          <Heading style={{ fontSize: "24px", color: "#333" }}>
            Course Published!
          </Heading>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Hi {instructorName},
          </Text>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Great news! Your course <strong>{courseTitle}</strong> has been approved and is now live
            on LearnHub. Students can now discover and enroll in your course.
          </Text>
          <Text style={{ fontSize: "14px", color: "#999", marginTop: "32px" }}>
            The LearnHub Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
