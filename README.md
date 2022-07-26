# 원티드 프리온보딩 개인과제 SNS 서비스

## 프로젝트 진행 기간



`2022.07.20 ~ 07.26`

## 사용 기술



- Typescript, NestJS
- JWT
- Github

## 서비스 개요



- 사용자는 SNS에 가입하여 게시글을 작성,수정,삭제,복구하고 다른사람의 게시글을 확인하고, 게시글에 좋아요를 할 수 있습니다.

## 요구사항 분석



A. 유저관리

- 회원가입
    - 이메일, 비밀번호, 닉네임을 입력받아 회원가입을 진행합니다.
- 로그인 및 인증
    - 로그인시 액세스 토큰과 리프레쉬 토큰을 발급받습니다.

B. 게시글

- 작성
    - 제목, 내용, 해시태그를 입력하여 글을 작성합니다.
- 수정
    - 작성자만 해당 게시글을 수정합니다.
- 삭제
    - 작성자만 해당 게시글을 삭제합니다.
- 복구
    - 삭제된 글의 경우 작성자만 해당 게시글을 복구합니다.
- 목록
    - 정렬, 검색, 필터링, 페이지
- 상세보기
    - 게시물 상세보기를 할때마다 조회수가 1 증가합니다.
    - 작성자를 포함한 모든 사용자는 게시글에 좋아요를 누를 수 있습니다.
    - 좋아요! : 좋아요를 최초 누른경우 ‘좋아요'수가 1 증가
    - 좋아요취소!: 중복으로 누른경우 ‘좋아요'수가 1 감소

## API Docs

| HTTP Method | URI | Function Name | Error Code |
| --- | --- | --- | --- |
| POST | /sns/auth/sign-up | 회원가입 |  |
| POST | /sns/auth/sign-in | 로그인 | 401 Unauthorized |
| POST | /sns/posts | 게시글 작성 |  |
| GET | /sns/posts | 게시글 목록 조회 |  |
| GET | /sns/posts/<id> | 게시글 상세조회 | 404 NotFoundException |
| PATCH | /sns/posts/<id> | 게시글 수정 | 400 BadRequestException / 403 ForbiddenException |
| PATCH | /sns/posts/<id>/restore | 게시글 복구 | 403 ForbiddenException (이중복구 / 작성자 본인이 아닌경우) |
| DELETE | /sns/posts/<id> | 게시글 삭제 | 403 ForbiddenException (이중삭제 / 작성자 본인이 아닌경우) |
| GET | /sns/posts/<id>/like | 게시글 좋아요 | 400 BadRequestException  |

## ERD


![스크린샷 2022-07-26 오전 11 18 26](https://user-images.githubusercontent.com/85995802/180911429-67d37023-7cf2-4355-bbab-fe2b19f75477.png)

