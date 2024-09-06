import React, { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface IWebPortalProps {
  children: ReactNode;
}

const WebPortal: React.FC<IWebPortalProps> = ({ children }) => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const node = document.createElement("div");
      document.body.appendChild(node);
      setPortalNode(node);

      return () => {
        document.body.removeChild(node);
      };
    }
  }, []);

  return portalNode ? createPortal(children, portalNode) : null;
};

export default WebPortal;
