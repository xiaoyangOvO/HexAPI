import React from 'react';
import './style.css';

// 静态导入所有厂商图标
import openaiIcon from '../../img/vendors/openai.svg';
import claudeIcon from '../../img/vendors/claude.svg';
import geminiIcon from '../../img/vendors/gemini.svg';
import baiduIcon from '../../img/vendors/baidu.svg';
import alibabaIcon from '../../img/vendors/alibaba.svg';
import tencentIcon from '../../img/vendors/tencent.svg';
import mistralIcon from '../../img/vendors/mistral.svg';
import anthropicIcon from '../../img/vendors/anthropic.svg';
import qwenIcon from '../../img/vendors/qwen.svg';
import miniMaxIcon from '../../img/vendors/minimax.svg';
import hunyuanIcon from '../../img/vendors/hunyuan.svg';
import sparkIcon from '../../img/vendors/spark.svg';

const vendors = [
  openaiIcon,
  claudeIcon,
  geminiIcon,
  baiduIcon,
  alibabaIcon,
  tencentIcon,
  mistralIcon,
  anthropicIcon,
  qwenIcon,
  miniMaxIcon,
  hunyuanIcon,
  sparkIcon
];

const VendorScroll = () => {
  return (
    <div className="vendor-scroll-container">
      <div className="vendor-scroll-track">
        {/* 第一组图标 */}
        {vendors.map((vendor, index) => (
          <div key={`vendor-1-${index}`} className="vendor-icon">
            <img src={vendor} alt={`Vendor ${index + 1}`} />
          </div>
        ))}
        {/* 第二组图标（用于无缝滚动） */}
        {vendors.map((vendor, index) => (
          <div key={`vendor-2-${index}`} className="vendor-icon">
            <img src={vendor} alt={`Vendor ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorScroll; 