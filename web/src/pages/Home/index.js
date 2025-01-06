import React, { useContext, useEffect, useState, useRef } from 'react';
import { Card, Col, Row, Typography, Button, Space, Badge, Spin, Timeline } from '@douyinfe/semi-ui';
import { 
  IconGithubLogo, 
  IconServer, 
  IconSetting, 
  IconPulse, 
  IconLayers,
  IconKey,
  IconChevronRight,
  IconCode,
  IconPlay,
  IconBox,
  IconCommand,
  IconTick,
  IconClose,
  IconCoinMoneyStroked,
  IconApps,
  IconBolt,
  IconChecklistStroked
} from '@douyinfe/semi-icons';
import { API, showError, showNotice, timestamp2string } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import VendorShowcase from '../../components/VendorShowcase';
import VendorScroll from '../../components/VendorScroll';
import './style.css';

const { Text, Title } = Typography;

const TypewriterText = ({ lines }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const text = lines[currentLine];
    
    const type = () => {
      if (isDeleting) {
        if (currentIndex > 0) {
          setCurrentText(text.substring(0, currentIndex - 1));
          setCurrentIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setCurrentLine((prev) => (prev + 1) % lines.length);
        }
      } else {
        if (currentIndex < text.length) {
          setCurrentText(text.substring(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
        } else {
          setTimeout(() => {
            setIsDeleting(true);
          }, 2000); // 等待2秒后开始删除
        }
      }
    };

    const timer = setTimeout(type, isDeleting ? 30 : 50);
    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, currentLine, lines]);

  return (
    <div className="typewriter-container">
      <span className="typewriter-text">{currentText}</span>
      <span className="cursor">|</span>
    </div>
  );
};

const AppIcon = ({ src, tooltip }) => (
  <div className="app-icon" tabIndex="0">
    <div className="semi-image">
      <img src={src} width="32" height="32" alt={tooltip} />
    </div>
  </div>
);

const ComparisonItem = ({ hexapi, official }) => (
  <div className="comparison-item">
    <div className="comparison-side hexapi">
      <IconTick className="icon" />
      <span>{hexapi}</span>
    </div>
    <div className="comparison-side official">
      <IconClose className="icon" />
      <span>{official}</span>
    </div>
  </div>
);

const Home = () => {
  const { t } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [loading, setLoading] = useState(true);

  const typewriterLines = [
    '在这个开放与分享的时代，',
    'OpenAI引领了一场人工智能的革命。',
    '最令人激动的是，我们已经做好准备。',
    '现在我们骄傲的向全世界宣布，',
    '我们已经完全支持OpenAI、Claude的全模型以及国产各大模型',
    '向世界共享更强大的人工智能技术'
  ];

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);
    } else {
      showError(message);
    }
    setHomePageContentLoaded(true);
    setLoading(false);
  };

  useEffect(() => {
    displayNotice();
    displayHomePageContent();
  }, []);

  const renderDashboard = () => (
    <div className="dashboard-container">
      <div className="hero-section">
        <Row align="middle" className="hero-row">
          <Col xs={24} sm={24} lg={12} className="hero-content-left">
            <div className="hero-title-wrapper">
              <Space align="start" className="title-badge">
                <Title heading={1} className="gradient-text">
                  云雾 API
                  <Badge count="New" type="primary" className="version-badge" />
                </Title>
              </Space>
            </div>
            
            <div className="typewriter-wrapper">
              <TypewriterText lines={typewriterLines} />
            </div>

            <Space className="hero-actions">
              <Button type="primary" theme="solid" size="large" className="get-started-btn">
                前往工作台
              </Button>
              <Button type="tertiary" size="large" className="docs-btn">
                API文档
              </Button>
            </Space>

            <div className="integration-section">
              <Title heading={5} className="section-label">40+ 业务线已接入</Title>
              <VendorScroll />
              
              <Title heading={5} className="section-label">常用应用支持</Title>
              <Space className="app-icons-grid" align="center" wrap>
                <div className="app-icon" tabIndex="0">
                  <div className="i-custom:chatweb" style={{ width: '36px', height: '36px' }}></div>
                </div>
                <div className="app-icon" tabIndex="0">
                  <div className="i-mingcute:translate-2-line text-pink" style={{ width: '48px', height: '48px' }}></div>
                </div>
                <div className="app-icon" tabIndex="0">
                  <div className="i-tabler:brand-openai" style={{ width: '40px', height: '40px' }}></div>
                </div>
                <div className="app-icon" tabIndex="0">
                  <img src="https://lobehub.com/_next/static/media/logo.98482105.png" style={{ width: '40px', height: '40px' }} alt="LobeHub" />
                </div>
                <div className="app-icon" tabIndex="0">
                  <div className="i-custom:codegpt" style={{ width: '48px', height: '48px' }}></div>
                </div>
                <div className="app-icon" tabIndex="0">
                  <img src="https://api2d.com/opencat.logo.png" style={{ width: '40px', height: '40px' }} alt="OpenCat" />
                </div>
                <div className="app-icon" tabIndex="0">
                  <img src="https://api2d.com/botjun.logo.png" style={{ width: '40px', height: '40px' }} alt="BotJun" />
                </div>
                <div className="app-icon" tabIndex="0">
                  <div className="i-custom:cursor" style={{ width: '40px', height: '40px' }}></div>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={24} lg={12} className="hero-content-right">
            <Card className="feature-timeline-card">
              <Title heading={3}>专业运营</Title>
              <Text type="tertiary" className="card-description">
                我们致力于提供可持续且高质量的服务，运用先进的技术架构保障API服务的稳定性与高可用性。
              </Text>
              
              <Timeline mode="left">
                <Timeline.Item 
                  dot={
                    <div className="timeline-icon gold">
                      <IconCoinMoneyStroked size="large" />
                    </div>
                  }
                >
                  <Title heading={6}>按量付费</Title>
                  <div className="timeline-content">根据实际使用量付费，余额不过期，可随时充值，灵活高效。</div>
                </Timeline.Item>

                <Timeline.Item
                  dot={
                    <div className="timeline-icon cyan">
                      <IconApps size="large" />
                    </div>
                  }
                >
                  <Title heading={6}>广泛支持</Title>
                  <div className="timeline-content">兼容OpenAI官方库及多数开源聊天应用</div>
                </Timeline.Item>

                <Timeline.Item
                  dot={
                    <div className="timeline-icon pink">
                      <IconCoinMoneyStroked size="large" />
                    </div>
                  }
                >
                  <Title heading={6}>透明计费</Title>
                  <div className="timeline-content">提供详细的请求消耗统计，价格透明，无隐性消费，让您用得放心。</div>
                </Timeline.Item>

                <Timeline.Item
                  dot={
                    <div className="timeline-icon teal">
                      <IconBolt size="large" />
                    </div>
                  }
                >
                  <Title heading={6}>超高并发</Title>
                  <div className="timeline-content">默认支持大部分用户的并发需求，若有超高需求，请联系客服进行咨询。</div>
                </Timeline.Item>

                <Timeline.Item
                  dot={
                    <div className="timeline-icon purple">
                      <IconChecklistStroked size="large" />
                    </div>
                  }
                >
                  <Title heading={6}>高稳定性</Title>
                  <div className="timeline-content">提供公开日志，记录每次模型请求速度，稳定性远超逆向中转，确保服务可靠。</div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="background-animation">
        <div className="stars"></div>
        <div className="gradient-blob"></div>
        <div className="gradient-blob"></div>
        <div className="gradient-blob"></div>
      </div>
      {homePageContentLoaded && homePageContent === '' ? (
        renderDashboard()
      ) : (
        <>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: homePageContent }}></div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
