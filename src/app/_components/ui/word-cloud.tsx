import { scaleLinear } from '@visx/scale';
import { Text } from '@visx/text';
import { Wordcloud } from '@visx/wordcloud';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface WordCloudProps {
  width: number;
  height: number;
  showControls?: boolean;
  words: WordData[];
  colors?: string[];
  showTooltips?: boolean;
  tooltipFormatter?: (word: WordData) => string;
}

export interface WordData {
  text: string;
  value: number;
}

// custom interface for the cloud word structure returned by visx wordcloud to fix type errors
interface CloudWord extends WordData {
  x: number;
  y: number;
  rotate: number;
  size: number;
  font: string;
}

// Default colors for words - light mode
const defaultLightColors = ['#143059', '#2F6B9A', '#82a6c2'];
// Dark mode colors - lighter versions
const defaultDarkColors = ['#60a5fa', '#93c5fd', '#dbeafe'];

function getRotationDegree() {
  return (Math.random() - 0.5) * 120; 
}

const fixedValueGenerator = () => 0.5;

type SpiralType = 'archimedean' | 'rectangular';

export const WordcloudChart = ({
  width,
  height,
  showControls = false,
  words = [],
  colors,
  showTooltips = true,
  tooltipFormatter,
}: WordCloudProps) => {
  const [spiralType, setSpiralType] = useState<SpiralType>('archimedean');
  const [withRotation, setWithRotation] = useState(false);
  const { theme } = useTheme();

  const themeColors =
    colors || (theme === 'dark' ? defaultDarkColors : defaultLightColors);

  // replaced scaleLog with scaleLinear
  const fontScale = scaleLinear({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [16, 100],
  });
  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  return (
    <div className="wordcloud">
      <Wordcloud
        words={words}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={'Impact'}
        padding={1}
        spiral={spiralType}
        rotate={withRotation ? getRotationDegree : 0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => {
            const word = w as CloudWord;

            const wordElement = (
              <Text
                key={word.text}
                fill={themeColors[i % themeColors.length]}
                textAnchor={'middle'}
                transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                fontSize={word.size}
                fontFamily={word.font}
                style={{ cursor: showTooltips ? 'pointer' : 'default' }}
              >
                {word.text}
              </Text>
            );

            if (showTooltips) {
              return (
                <TooltipProvider key={word.text} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>{wordElement}</TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {tooltipFormatter
                          ? tooltipFormatter({
                              text: word.text,
                              value: word.value,
                            })
                          : `${word.text}: ${word.value} occurrence${word.value > 1 ? 's' : ''}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return wordElement;
          })
        }
      </Wordcloud>
      {showControls && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '10px',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            Spiral type
            <select
              onChange={(e) => setSpiralType(e.target.value as SpiralType)}
              value={spiralType}
            >
              <option key={'archimedean'} value={'archimedean'}>
                archimedean
              </option>
              <option key={'rectangular'} value={'rectangular'}>
                rectangular
              </option>
            </select>
          </label>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            With rotation
            <input
              type="checkbox"
              checked={withRotation}
              onChange={() => setWithRotation(!withRotation)}
            />
          </label>
        </div>
      )}
      <style>{`
        .wordcloud {
          display: flex;
          flex-direction: column;
          user-select: none;
          align-items: center;
        }
        .wordcloud svg {
          margin: 1rem 0;
        }

        .wordcloud label {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          margin-right: 8px;
        }
        .wordcloud textarea {
          min-height: 100px;
        }
      `}</style>
    </div>
  );
};
