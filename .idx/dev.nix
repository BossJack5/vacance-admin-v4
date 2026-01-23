{ pkgs, ... }: {
  # 사용할 채널 설정
  channel = "stable-23.11";

  # 필수 패키지 설치 (Node.js 포함)
  packages = [
    pkgs.nodejs_20
    pkgs.psmisc
    pkgs.firebase-tools # Firebase CLI 추가
  ];

  idx = {
    # 사용할 확장 프로그램
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];

    # 프리뷰 설정
    previews = {
      enable = true;
      previews = {
        web = {
          # 중요: 쉼표 없이 공백으로만 구분합니다.
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };

    # 워크스페이스 생명주기 설정
    workspace = {
      onCreate = {
        # 프로젝트 생성 시 자동 실행
        npm-install = "npm install";
      };
    };
  };
}
